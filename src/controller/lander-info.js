const Lander = require('./../model/Lander')
const Renter = require('./../model/Renter')
const LanderLogin = require('./../model/LanderLogin')
const House = require('./../model/House')
const Book = require('./../model/Book')

const config = require('../../config')

const ApiError = require('../util/error').ApiError
const AuthError = require('../util/error').AuthError

const geneToken = require('../util/util').geneToken
const requetWxOpenId = require('../util/request').requetWxOpenId

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
        let houses = await House.find({openid: openid, is_delete_status: false},{openid:openid,house_name:1,area:1,_id:0})
        console.log(houses)
        ctx.restSuccess({list:houses})
    },

    async toGetHouseBook(ctx) {

        let token = ctx.request.header.authorization.split(" ")[1]
        //   1.先找到所有的房子， 数据库中查找token对应的openid，这样可以保证一个用户只有一个token有效
        let landerLogin = await LanderLogin.findOne({token: token})
        let openid
        if (!landerLogin) {
            console.log("身份验证已经失效，请重新登录")
            throw new AuthError("身份验证已经失效，请重新登录")
        }
        openid = landerLogin.openid
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


        let token = ctx.request.header.authorization.split(" ")[1]
        //   1. 数据库中查找token对应的openid，这样可以保证一个用户只有一个token有效
        let landerLogin = await LanderLogin.findOne({token: token})
        let openid
        if (!landerLogin) {
            console.log("身份验证已经失效，请重新登录")
            throw new AuthError("身份验证已经失效，请重新登录")
        }
        openid = landerLogin.openid


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

    }
}