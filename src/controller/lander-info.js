const Lander = require('./../model/Lander')
const Renter = require('./../model/Renter')
const LanderLogin = require('./../model/LanderLogin')
const House = require('./../model/House')
const Book = require('./../model/Book')
const Bill = require('./../model/Bill')
const LanderAccount = require('./../model/LanderAccount')
const CashOrder = require('./../model/CashOrder')

const config = require('../../config')

const ApiError = require('../util/error').ApiError
const AuthError = require('../util/error').AuthError

const geneToken = require('../util/util').geneToken
const requetWxOpenId = require('../util/request').requetWxOpenId
const requetGetCashToLander = require('../util/request').requetGetCashToLander

const wxPay = require('../util/pay-util')

const formatTimeYMD = require('../util/util').formatTimeYMD
const getNextMonth = require('../util/util').getNextMonth


const getXMLNodeValue = require('../util/xml-util').getXMLNodeValue


async function geneBill(book) {
    let house_id = book.house_id
    let house = await House.findOne({_id: house_id, is_delete_status: false})
    if (!house) {
        return
    }
    let house_name = house.house_name
    let rent_begin_date = new Date(book.rent_begin_date)
    let rent_month_count = parseInt(book.rent_month_count.split('个月')[0])
    let pay_in_day = book.pay_in_day
    let add_bill_ids = []
    //生成第一个月，第二个月，第三个月的房租
    for (let i = 1; i <= rent_month_count; i++) {
        let bill_mark = i
        //判断该账单是否存在
        let hasBill = await Bill.findOne({book_id: book._id, bill_mark: bill_mark, is_delete_status: false})
        if (hasBill) {
            continue//改账单已经存在了，下一个
        }

        console.log("bill_mark = " + bill_mark)
        let start_date = formatTimeYMD(getNextMonth(rent_begin_date, i - 1))

        if(i!==1){
            let _start_date = getNextMonth(rent_begin_date,i-1)
            _start_date.setDate(_start_date.getDate()+1)
            start_date = formatTimeYMD(_start_date)
        }
        let over_date = formatTimeYMD(getNextMonth(rent_begin_date, i))
        let out_trade_no = wxPay.createOrderNum()

        // let title = start_date.split('/')[0] + '年' + start_date.split('/')[1] + '月' + '房租'
        let title = "第"+i+"期房租"
        let total_fee = book.money_per_month

        let newBill = new Bill({
            book_id: book._id,
            bill_mark: bill_mark,
            out_trade_no: out_trade_no,
            start_date: start_date,
            over_date: over_date,
            total_fee: total_fee,
            pay_in_day: pay_in_day,
            house_name: house_name,
            title: title

        });
        newBill = await newBill.save()
    }

}

module.exports = {
    //注册
    async postLanderToken(ctx) {
        // ...
        let {wx_login_code, wx_user_info} = ctx.request.body

        console.log(wx_user_info)
        if (!wx_login_code) {
            throw new ApiError("code不能为空")
        }

        console.log('ssssssssss')
        console.log(config)
        //1.获取openid
        let openid
        await requetWxOpenId(wx_login_code, config.lander_wx.appid, config.lander_wx.secret, res => {
            // console.log(res)
            if (res.errcode) {
                throw new ApiError(res.errmsg, res.errcode)
            }
            console.log("成功")
            openid = res.openid
        }, err => {
            throw err
        })

        console.log('保存用户')
        //2.保存用户
        let lander = await Lander.findOne({openid: openid});
        if (!lander) {
            //保存该openid，暂时没有加入lander_id，但是是必要的，多平台会好点
            const newLander = new Lander({
                openid: openid,
                wx_user_info: wx_user_info
            });
            console.log('保存用户1111')
            lander = await newLander.save();
            if (lander.errors) {
                throw new ApiError('数据保存出错')
            } else {
                console.log("保存房东opneId成功")
                console.log(lander)
            }
        }
        console.log('保存用户2222')

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
            openid: openid,
            area: area,
            house_name: house_name,
            is_delete_status: false
        });
        house = await newHouse.save()
        if (newHouse.errors) {
            throw new ApiError('数据保存出错')
        }

        ctx.restSuccess({house: house})
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
        let houses = await House.find({openid: openid, is_delete_status: false}, {
            openid: 1,
            house_name: 1,
            area: 1,
            _id: 0
        })
        console.log(houses)
        ctx.restSuccess({list: houses})
    },

    async toGetHouseBook(ctx) {

        let openid = ctx.login.openid
        let houses = await House.find({openid: openid, is_delete_status: false}, {
            openid: openid,
            house_name: 1,
            area: 1
        })

        //2. 找到房子下的账本，根据房子objectid的house_id
        for (let i = 0; i < houses.length; i++) {
            console.log("-----")
            let item = houses[i].toObject()
            let book = await Book.findOne({house_id: item._id, is_delete_status: false})

            if(book){
                book = book.toObject()
                let rent_month_count = parseInt(book.rent_month_count.split('个月')[0])

                book.rent_end_date = formatTimeYMD(getNextMonth(new Date(book.rent_begin_date),rent_month_count))
                book.rent_begin_date = formatTimeYMD(new Date(book.rent_begin_date))
            }


            //还要给有renter_id的找头像，这个book有可能是空的
            if (book && book.renter_id) {
                let renter = await Renter.findOne({openid: book.renter_id})
                if (renter) {
                    book.user_image = renter.wx_user_info.avatarUrl
                }
            }

            item.book = book
            houses[i] = item
            //
            // console.log(houses[i])
        }

        // console.log(houses)
        ctx.restSuccess({list: houses})
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
            house_id,
            renter_phone,
            renter_name,
            rent_begin_date,
            rent_month_count,
            pay_in_day,
            pay_month_count,
            money_secure,
            money_per_month,
            is_delete_status: false
        });
        let book = await newBook.save()
        if (newBook.errors) {
            throw new ApiError('数据保存出错')
        }
        ctx.restSuccess({book: book})
        console.log('添加成功')

    },

    //生成该账本下的账单
    async postBookBill(ctx) {

        console.log('postBookBill')
        let {book_id} = ctx.request.body

        if (!book_id) {
            throw new ApiError("没有找到该账本")
        }
        //找到这个账本的信息
        let book = await Book.findOne({_id: book_id, is_delete_status: false});
        if (!book) {
            throw new ApiError("没有找到该账本")
        }

        //找房源
        let house_id = book.house_id
        let house = await House.findOne({_id: house_id, is_delete_status: false})
        if (!house) {
            throw new ApiError("该账本已经无效")
        }

        let house_name = house.house_name
        let rent_begin_date = new Date(book.rent_begin_date)
        let rent_month_count = parseInt(book.rent_month_count.split('个月')[0])
        let pay_in_day = book.pay_in_day
        let add_bill_ids = []
        //生成第一个月，第二个月，第三个月的房租
        for (let i = 1; i <= rent_month_count; i++) {
            let bill_mark = i
            //判断该账单是否存在
            let hasBill = await Bill.findOne({book_id: book_id, bill_mark: bill_mark, is_delete_status: false})
            if (hasBill) {
                continue//改账单已经存在了，下一个
            }


            let start_date = formatTimeYMD(getNextMonth(rent_begin_date, i - 1))
            let over_date = formatTimeYMD(getNextMonth(rent_begin_date, i))
            let out_trade_no = wxPay.createOrderNum()

            let title = start_date.split('/')[0] + '年' + start_date.split('/')[1] + '月' + '房租'
            let total_fee = book.money_per_month

            let newBill = new Bill({
                book_id: book_id,
                bill_mark: bill_mark,
                out_trade_no: out_trade_no,
                start_date: start_date,
                over_date: over_date,
                total_fee: total_fee,
                pay_in_day: pay_in_day,
                house_name: house_name,
                title: title

            });
            newBill = await newBill.save()

            if (newBill.errors) {
                // throw new ApiError('数据保存出错')
            } else {
                add_bill_ids.push(newBill._id)
            }
        }


        ctx.restSuccess({add_bill_ids: add_bill_ids})

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

    /**
     *
     * *
     * 房源删除后已经支付的账单还是要返回的，如此如此。
     *
     *
     * */
    //获取所有账单
    async toGetBill(ctx) {

        let {book_id, trade_state} = ctx.request.query

        let openid = ctx.login.openid


        if (!trade_state) {
            trade_state = "NOTPAY"
        }

        if (trade_state.split("&&").length === 1) {
            console.log("单个")
        } else {
            let trade_state_arr = trade_state.split("&&")
            trade_state = {"$in": []}
            for (let i = 0; i < trade_state_arr.length; i++) {
                trade_state["$in"].push(trade_state_arr[i])
            }
        }



        if (book_id) {
            //指定了book，获取该book_id下的账单，没有指定就获取全部
        } else {
            let houses = await House.find({openid: openid}, {
                openid: 1,
                house_name: 1,
                area: 1
            })
            let house_id = {"$in": []}
            for (let i = 0; i < houses.length; i++) {
                house_id["$in"].push(houses[i]._id)
            }

            let books = await Book.find({house_id: house_id}, {is_delete_status: 0, __v: 0})
            book_id = {"$in": []}
            for (let i = 0; i < books.length; i++) {
                book_id["$in"].push(books[i]._id)
            }
        }

        // console.log("-----books-----")
        // console.log(books)

        //头像呢？ bill->book-->renter-->image
        let bills = await Bill.find({
            book_id: book_id,
            trade_state: trade_state ,
            is_delete_status: false
        }, { __v: 0, is_delete_status: 0}).sort("start_date")


        //筛选掉start_date大于今天的账单
        let bills_return = []
        let currentDate = new Date()
        for (let i = 0; i < bills.length; i++) {
            let start_date = new Date(bills[i].start_date)
            if (start_date > currentDate) {
                // console.log("大于今天，未到付款日期")


                if(bills[i].bill_mark==="1"){
                    bills_return.push(bills[i])
                }
            } else {
                bills_return.push(bills[i])
                // console.log("小于今天，已到付款日期")
            }
        }
        bills = bills_return


        //筛选掉账本删除，支付状态为NOTPAY的账单
        bills_return = []
        for (let i = 0; i < bills.length; i++) {
            let item = bills[i].toObject()
            let book = await Book.findOne({_id: item.book_id}, { __v: 0})

            if(book.is_delete_status&&item.trade_state==="NOTPAY"){
                console.log("要删除")
            }else{
                //    设置头像
                let renter = await Renter.findOne({openid: book.renter_id})
                if (renter) {
                    item.user_image = renter.wx_user_info.avatarUrl
                }

                bills_return.push(item)
            }

        }
        bills = bills_return




        // for (let i = 0; i < bills.length; i++) {
        //     let item = bills[i].toObject()
        //     let book = await Book.findOne({_id: item.book_id}, { __v: 0})
        //
        //     let renter = await Renter.findOne({openid: book.renter_id})
        //     if (renter) {
        //         item.user_image = renter.wx_user_info.avatarUrl
        //         bills[i] = item
        //     }
        //
        // }
        //trade_state:"NOTPAY",
        //所有的账本，然后再根据账本的id去找
        // for (let i = 0; i < books.length; i++) {
        //     let book_id = books[i]._id
        //     let bills = await Bill.find({book_id: book_id,trade_state:"NOTPAY",is_delete_status: false},{bill_mark:0,trade_state:0,__v:0,out_trade_no:0,is_delete_status:0})
        //     // console.log(bills)
        //     allBill= allBill.concat(bills)
        //
        // }
        ctx.restSuccess({list: bills})
    },


    //
    async toPutBillClose(ctx) {
        let {bill_id, moneyday, moneyway} = ctx.request.body

        if (!bill_id || !moneyday || !moneyway) {
            throw new ApiError("参数错误，请修改后再次提交")
        }

        let bill = await Bill.findOne({_id: bill_id, trade_state: "NOTPAY", is_delete_status: false}, {
            bill_mark: 0,
            __v: 0,
            is_delete_status: 0
        })

        if (!bill) {
            throw new ApiError("操作失败，该账单已经完成")
        }

        bill.trade_state = "CLOSED"
        bill.close_info = {moneyday, moneyway}
        bill = await bill.save();
        if (bill.errors) {
            throw new ApiError('数据保存出错')
        }
        ctx.restSuccess({bill: bill})

    },

    async toDeleteHouse(ctx) {
        let {house_id} = ctx.params
        //    判断其有没有未删除的账本
        let book = await Book.findOne({house_id: house_id, is_delete_status: false})

        if (book) {
            throw new ApiError('删除房源前请先删除账本（租客退房）')
        }

        let house = await House.findOne({_id: house_id, is_delete_status: false})

        if (!house) {
            throw new ApiError('没有找到该房源')
        }
        house.is_delete_status = true
        house = await house.save();
        if (house.errors) {
            throw new ApiError('数据保存出错')
        }

        ctx.restSuccess({house: house})

    },

    async toDeleteBook(ctx) {
        let {book_id} = ctx.params
        if (!book_id || book_id === "undefined") {
            throw new ApiError('没有找到该账本')
        }
        let book = await Book.findOne({_id: book_id, is_delete_status: false})
        if (!book) {
            throw new ApiError('没有找到该账本')
        }

        book.is_delete_status = true
        book = await book.save();
        if (book.errors) {
            throw new ApiError('数据保存出错')
        }

        ctx.restSuccess({book: book})
    },


    async toPutBookMoney(ctx) {
        console.log('toPutBookMoney')
        let {book_id} = ctx.params
        let {rent_month_count, money_per_month} = ctx.request.body

        if (!book_id || book_id === "undefined") {
            throw new ApiError('没有找到该账本')
        }
        let book = await Book.findOne({_id: book_id, is_delete_status: false})
        if (!book) {
            throw new ApiError('没有找到该账本')
        }
        rent_month_count = (parseInt(book.rent_month_count.split('个月')[0]) + parseInt(rent_month_count.split('个月')[0])).toString() + "个月"
        book.rent_month_count = rent_month_count
        book.money_per_month = money_per_month
        book = await book.save();

        await geneBill(book)
        if (book.errors) {
            throw new ApiError('数据保存出错')
        }

        ctx.restSuccess({book: book})

    },


    async toGetLanderAccount(ctx) {
        console.log('toGetLanderAccount')
        let openid = ctx.login.openid

        let landerAccount = await LanderAccount.findOne({lander_id: openid})

        if (landerAccount) {
            ctx.restSuccess({balance: landerAccount.balance})
        } else {
            ctx.restSuccess({balance: 0})
        }
    },


    // async toPutLanderAccountBalance(ctx) {
    //     console.log('toPutLanderAccountBalance')
    //     let openid = ctx.login.openid
    //     let partner_trade_no = "201803211833"
    //     await requetGetCashToLander(partner_trade_no,openid,xml => {
    //         console.log(xml)
    //     }, err => {
    //         console.log("提现失败")
    //         throw err
    //     })
    // },

//    创建提现的订单
    async toPutLanderAccountBalance(ctx) {

        console.log("toPutLanderAccountBalance")
        let openid = ctx.login.openid
        let {amount} = ctx.request.body
        console.log("amount = "+amount)
        amount = parseInt(amount)
        if (!amount) {
            throw new ApiError('参数出错')
        }

        console.log(amount)

        //首先判读帐号的金额够不够啊，还有今天提现了多少之类的，不能超过2w，不能少于1元
        let landerAccount = await LanderAccount.findOne({lander_id: openid})
        if (!landerAccount) {
            throw new ApiError('账户余额不足')
        }

        if (amount > parseInt(landerAccount.balance)) {
            throw new ApiError('账户余额不足')
        }

        if (amount < 100) {
            throw new ApiError('提现金额需要大于1元')
        }

        let total = amount
        //今天的范围是从昨天最后一刻到明天第一刻，这样可以保证没有漏洞啊，
        let today = new Date()
        let yesterday = new Date()
        yesterday.setDate(today.getDate() - 1)
        yesterday.setHours(23)
        yesterday.setMinutes(59)
        yesterday.setSeconds(59)
        let tomorrow = new Date()
        tomorrow.setDate(today.getDate() + 1)
        tomorrow.setHours(0)
        tomorrow.setMinutes(0)
        tomorrow.setSeconds(0)
        let cashOrders = await CashOrder.find({
            lander_id: openid, create_date: {
                "$gte": yesterday,
                "$lt": tomorrow
            }
        })
        for (let i = 0; i < cashOrders.length; i++) {
            let cashOrder = cashOrders[i]
            total = total + cashOrder.amount
        }
        if (total >= 2000000) {
            throw new ApiError('一天内提现不能超过2万元')
        }


        //以下是提现过程，首先账户余额减去提现金额，保存，之后创建提现记录，然后微信提现，提现成功即更改数据状态
        landerAccount.balance = parseInt(landerAccount.balance) - amount
        await landerAccount.save()
        if (landerAccount.errors) {
            throw new ApiError('数据异常')
        }

        let partner_trade_no = wxPay.createOrderNum()
        let newCashOrder = new CashOrder({
            lander_id: openid,
            partner_trade_no: partner_trade_no,
            amount: amount,

        });
        newCashOrder = await newCashOrder.save()


        await requetGetCashToLander(newCashOrder.partner_trade_no, newCashOrder.lander_id,amount, async (xml) => {
            console.log(xml)
            if (getXMLNodeValue('return_code', xml) === 'SUCCESS' && getXMLNodeValue('result_code', xml) === 'SUCCESS') {
                newCashOrder.status = "SUCCESS"
                newCashOrder.payment_time = getXMLNodeValue('payment_time', xml)
                await newCashOrder.save()
            }
        }, err => {
            //虽然提现操作失败，但是还是要给用户正确的返回信息，等待后台处理即可
            console.log("提现失败")
        })

        ctx.restSuccess({balance: landerAccount.balance})

        // console.log(newCashOrder)
        // if(!newCashOrder.errors){
        //     await requetGetCashToLander(newCashOrder.partner_trade_no,newCashOrder.lander_id,async (xml) => {
        //
        //         if (getXMLNodeValue('return_code', xml) === 'SUCCESS'&&getXMLNodeValue('result_code', xml) === 'SUCCESS') {
        //             newCashOrder.status="SUCCESS"
        //             newCashOrder.payment_time = getXMLNodeValue('payment_time', xml)
        //
        //             await newCashOrder.save()
        //
        //             console.log(xml)
        //         }
        //
        //     }, err => {
        //         console.log("提现失败")
        //         throw err
        //     })
        // }else{
        //     throw new ApiError('数据出错')
        // }


    },


    async toGetCashOrders(ctx) {
        let {status} = ctx.request.query
        let openid = ctx.login.openid
        if (!status) {
            status = "NOTPAY&&SUCCESS"
        }

        console.log(status)

        if (status.split("&&").length === 1) {
            console.log("单个")
        } else {
            let trade_state_arr = status.split("&&")
            status = {"$in": []}
            for (let i = 0; i < trade_state_arr.length; i++) {
                status["$in"].push(trade_state_arr[i])
            }
        }

        console.log('status = '+status)

        let cashOrders = await CashOrder.find({lander_id: openid, status: status},{lander_id:0,__v:0}).sort("create_date")
        ctx.restSuccess({list: cashOrders})
    },


    async toGetCashOrderDetail(ctx) {

        console.log("toGetCashOrderDetail--------")
        let {cash_order_id} = ctx.params

        if(!cash_order_id){
            throw new ApiError("参数有错误")
        }

        let cashOrder = await CashOrder.findOne({_id: cash_order_id},{__v:0})

        if(!cashOrder){
            throw new ApiError("没有找到该提现记录")
        }


        if(cashOrder.status==="NOTPAY"){
            await requetGetCashToLander(cashOrder.partner_trade_no, cashOrder.lander_id,cashOrder.amount, async (xml) => {
                console.log(xml)
                if (getXMLNodeValue('return_code', xml) === 'SUCCESS' && getXMLNodeValue('result_code', xml) === 'SUCCESS') {
                    cashOrder.status = "SUCCESS"
                    cashOrder.payment_time = getXMLNodeValue('payment_time', xml)
                    cashOrder = await cashOrder.save()
                }
            }, err => {
                //虽然提现操作失败，但是还是要给用户正确的返回信息，等待后台处理即可
                console.log("提现失败")
            })
        }


        ctx.restSuccess({cashOrder: cashOrder})

    },

    async toGetBookDetail(ctx) {
        console.log('toGetBookDetail')
        let {book_id} = ctx.params

        if (!book_id || book_id === "undefined") {
            throw new ApiError('没有找到该账本')
        }
        let book = await Book.findOne({_id: book_id, is_delete_status: false})
        if (!book) {
            throw new ApiError('没有找到该账本')
        }

        book = book.toObject()
        let rent_month_count = parseInt(book.rent_month_count.split('个月')[0])

        book.rent_end_date = formatTimeYMD(getNextMonth(new Date(book.rent_begin_date),rent_month_count))
        book.rent_begin_date = formatTimeYMD(new Date(book.rent_begin_date))

        console.log("**********************")
        console.log(book)
        ctx.restSuccess({book: book})

    }



}