const Lander = require('./../model/Lander')
const Renter = require('./../model/Renter')
const LanderLogin = require('./../model/LanderLogin')
const House = require('./../model/House')
const Book = require('./../model/Book')
const Bill = require('./../model/Bill')

const config = require('../../config')

const ApiError = require('../util/error').ApiError
const AuthError = require('../util/error').AuthError

const geneToken = require('../util/util').geneToken
const requetWxOpenId = require('../util/request').requetWxOpenId

const wxPay = require('../util/pay-util')

const formatTimeYMD = require('../util/util').formatTimeYMD
const getNextMonth = require('../util/util').getNextMonth

module.exports = {
    //注册
    async postLanderToken(ctx) {
        // ...
        let {wx_login_code, wx_user_info} = ctx.request.body

        console.log(wx_user_info)
        if (!wx_login_code) {
            throw new ApiError("code不能为空")
        }

        //1.获取openid
        let openid
        await requetWxOpenId(wx_login_code, config.lander_wx.appid,config.lander_wx.secret,res => {
            // console.log(res)
            if (res.errcode) {
                throw new ApiError(res.errmsg, res.errcode)
            }
            // console.log("成功")
            openid = res.openid
        }, err => {
            throw err
        })

        //2.保存用户
        let lander = await Lander.findOne({openid: openid});
        if (!lander) {
            //保存该openid，暂时没有加入lander_id，但是是必要的，多平台会好点
            const newLander = new Lander({
                openid: openid,
                wx_user_info:wx_user_info
            });

            lander = await newLander.save();
            if (lander.errors) {
                throw new ApiError('数据保存出错')
            } else {
                console.log("保存房东opneId成功")
                console.log(lander)
            }
        }


        //3.获取token，根据lander_id，这里暂定openid生成token，然后保存在登录表里面，返回给用户即可
        let token = geneToken({openid: openid})
        let landerLogin = await LanderLogin.findOne({openid: openid});
        console.log("找到一个登录记录")
        console.log(landerLogin)
        if (landerLogin) {
            landerLogin.token = token
            landerLogin.create_date = new Date()
            landerLogin = await landerLogin.save()
        } else {
            const newLanderLogin = new LanderLogin({
                openid: openid,
                token: token,
                create_date: new Date()
            });
            landerLogin = await newLanderLogin.save()
        }

        if (landerLogin.errors) {
            throw new ApiError('数据保存出错')
        }

        //4.登录成功，返回token
        token = 'Bearer ' + token
        ctx.restSuccess({token: token})
    },

    async toAddHouse(ctx) {
        let {area, house_name} = ctx.request.body
        if (!house_name) {
            throw new ApiError("房屋名称不能为空")
        }

        let token = ctx.request.header.authorization.split(" ")[1]
        //   1. 数据库中查找token对应的openid，这样可以保证一个用户只有一个token有效
        let landerLogin = await LanderLogin.findOne({token: token})
        let openid
        if (!landerLogin) {
            console.log("身份验证已经失效，请重新登录")
            throw new AuthError("身份验证已经失效，请重新登录")
        }
        openid = landerLogin.openid
        console.log("openid = ====")
        console.log(openid)
        //  2.  需要判断房源的唯一性 openid 和 house_name 和 delete_status= false
        let house = await House.findOne({openid: openid, house_name: house_name, is_delete_status: false})
        if (house) {
            throw new ApiError('该房源已存在')
        }

        //  3. 添加房源
        const newHouse = new House({
            openid:openid,
            area: area,
            house_name: house_name,
            is_delete_status: false
        });
        house = await newHouse.save()
        if (newHouse.errors) {
            throw new ApiError('数据保存出错')
        }

        ctx.restSuccess({house:house})
    },

    async toGetHouse(ctx) {
        let token = ctx.request.header.authorization.split(" ")[1]
        //   1. 数据库中查找token对应的openid，这样可以保证一个用户只有一个token有效
        let landerLogin = await LanderLogin.findOne({token: token})
        let openid
        if (!landerLogin) {
            console.log("身份验证已经失效，请重新登录")
            throw new AuthError("身份验证已经失效，请重新登录")
        }
        openid = landerLogin.openid
        let houses = await House.find({openid: openid, is_delete_status: false},{openid:1,house_name:1,area:1,_id:0})
        console.log(houses)
        ctx.restSuccess({list:houses})
    },

    async toGetHouseBook(ctx) {

        let openid = ctx.login.openid
        let houses = await House.find({openid: openid, is_delete_status: false},{openid:openid,house_name:1,area:1})

        //2. 找到房子下的账本，根据房子objectid的house_id
        for(let i =0;i<houses.length;i++){
            console.log("-----")
            let item = houses[i].toObject()
            let book = await Book.findOne({house_id: item._id, is_delete_status: false})

            //还要给有renter_id的找头像，这个book有可能是空的
            if(book&&book.renter_id){
                let renter = await Renter.findOne({openid: book.renter_id})
                if(renter){
                    book = book.toObject()
                    book.user_image =renter.wx_user_info.avatarUrl
                }
            }

            item.book = book
            houses[i] = item
            //
            // console.log(houses[i])
        }

        // console.log(houses)
        ctx.restSuccess({list:houses})
        console.log("请求结束")
        // let houses = await Book.find({openid: openid, is_delete_status: false},{openid:openid,house_name:1,area:1})
    },

    async toAddBook(ctx) {

        let {house_id, renter_phone, renter_name, rent_begin_date, rent_month_count, pay_in_day, pay_month_count, money_secure, money_per_month} = ctx.request.body

        let openid = ctx.login.openid


        //是不是已经有账本了 house_id is_delete_status
        let hasbook = await Book.findOne({house_id: house_id, is_delete_status: false})

        if (hasbook) {
            throw new ApiError('该房源已经绑定租客（账本）')
        }

        const newBook = new Book({
            house_id, renter_phone, renter_name, rent_begin_date, rent_month_count, pay_in_day, pay_month_count, money_secure, money_per_month,
            is_delete_status: false
        });
        let book = await newBook.save()
        if (newBook.errors) {
            throw new ApiError('数据保存出错')
        }
        ctx.restSuccess({book:book})
        console.log('添加成功')

    },

    //生成该账本下的账单
    async postBookBill(ctx) {

        console.log('postBookBill')
        let {book_id} = ctx.request.body

        if(!book_id){
            throw new ApiError("没有找到该账本")
        }
        //找到这个账本的信息
        let book = await Book.findOne({_id: book_id,is_delete_status: false});
        if(!book){
            throw new ApiError("没有找到该账本")
        }

        //找房源
        let house_id = book.house_id
        let house = await House.findOne({_id: house_id,is_delete_status: false})
        if(!house){
            throw new ApiError("该账本已经无效")
        }

        let house_name = house.house_name
        let rent_begin_date = new Date(book.rent_begin_date)
        let rent_month_count = parseInt(book.rent_month_count.split('个月')[0])
        let pay_in_day = book.pay_in_day
        let add_bill_ids = []
        //生成第一个月，第二个月，第三个月的房租
        for(let i=1;i<=rent_month_count;i++){
            let bill_mark = i
            //判断该账单是否存在
            let hasBill = await Bill.findOne({book_id: book_id, bill_mark:bill_mark,is_delete_status: false})
            if(hasBill){
                continue//改账单已经存在了，下一个
            }


            let start_date = formatTimeYMD(getNextMonth(rent_begin_date,i-1))
            let over_date = formatTimeYMD(getNextMonth(rent_begin_date,i))
            let out_trade_no = wxPay.createOrderNum()

            let title = start_date.split('/')[0]+'年'+start_date.split('/')[1]+'月'+'房租'
            let total_fee = book.money_per_month

            let newBill = new Bill({
                book_id:book_id,
                bill_mark:bill_mark,
                out_trade_no : out_trade_no,
                start_date:start_date,
                over_date:over_date,
                total_fee: total_fee,
                pay_in_day:pay_in_day,
                house_name:house_name,
                title:title

            });
            newBill = await newBill.save()

            if (newBill.errors) {
                // throw new ApiError('数据保存出错')
            } else {
                add_bill_ids.push(newBill._id)
            }
        }


        ctx.restSuccess({add_bill_ids:add_bill_ids})

    },

    // //生成该账本下的账单
    // async toBookBill(ctx) {
    //     console.log('toBookBill')
    //     let {book_id} = ctx.request.body
    //
    //     if(!book_id){
    //         throw new ApiError("没有找到该账本")
    //     }
    //     //找到这个账本的信息
    //     let book = await Book.findOne({_id: book_id,is_delete_status: false});
    //     if(!book){
    //         throw new ApiError("没有找到该账本")
    //     }
    //
    //     let bills = await Bill.find({book_id: book_id,trade_state:"NOTPAY",is_delete_status: false})
    //
    //     ctx.restSuccess({list:bills})
    // }


    //获取所有账单
    async toGetBill(ctx) {

        let {book_id,trade_state} = ctx.request.query

        let openid = ctx.login.openid

        if(book_id){
            //指定了book，获取该book_id下的账单，没有指定就获取全部
        }else{

            let houses = await House.find({openid: openid, is_delete_status: false},{openid:1,house_name:1,area:1})
            let house_id = {"$in":[]}
            for(let i = 0; i < houses.length; i++){
                house_id["$in"].push(houses[i]._id)
            }

            let books = await Book.find({house_id: house_id, is_delete_status: false},{is_delete_status: 0, __v: 0})
            book_id = {"$in":[]}
            for(let i = 0; i < books.length; i++){
                book_id["$in"].push(books[i]._id)
            }
        }


        //头像呢？ bill->book-->renter-->image
        let bills = await Bill.find({book_id: book_id,trade_state:trade_state||"NOTPAY",is_delete_status: false},{bill_mark:0,__v:0,is_delete_status:0})

        for(let i=0;i<bills.length;i++){
            let item = bills[i].toObject()

            let book = await Book.findOne({_id: item.book_id, is_delete_status: false},{is_delete_status: 0, __v: 0})
            let renter = await Renter.findOne({openid: book.renter_id})
            if(renter){
                item.user_image =renter.wx_user_info.avatarUrl
                bills[i] = item
            }

        }
        //trade_state:"NOTPAY",
        //所有的账本，然后再根据账本的id去找
        // for (let i = 0; i < books.length; i++) {
        //     let book_id = books[i]._id
        //     let bills = await Bill.find({book_id: book_id,trade_state:"NOTPAY",is_delete_status: false},{bill_mark:0,trade_state:0,__v:0,out_trade_no:0,is_delete_status:0})
        //     // console.log(bills)
        //     allBill= allBill.concat(bills)
        //
        // }
        ctx.restSuccess({list:bills})
    }



}