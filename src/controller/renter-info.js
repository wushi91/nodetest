const Renter = require('./../model/Renter')
const RenterLogin = require('./../model/RenterLogin')
const Book = require('./../model/Book')
const House = require('./../model/House')
const Bill = require('./../model/Bill')

const config = require('../../config')

const ApiError = require('../util/error').ApiError
const AuthError = require('../util/error').AuthError

const geneToken = require('../util/util').geneToken
const getNextMonth = require('../util/util').getNextMonth
const formatTimeYMD = require('../util/util').formatTimeYMD

const requetWxOpenId = require('../util/request').requetWxOpenId
const requestWxPayData = require('../util/request').requestWxPayData
const requetQueryOrder = require('../util/request').requetQueryOrder

const getXMLNodeValue = require('../util/xml-util').getXMLNodeValue
const wxPay = require('../util/pay-util')


//这里要做好充足的判断，调用出错
async function orderSuccess(out_trade_no,bank_type,total_fee,time_end) {
    //首先查看该账单的状态不等于SUCCESS，如果等于就不用操作了

    // 订单支付成功后需要做的事情
    let bill = await Bill.findOne({out_trade_no:out_trade_no,trade_state:"NOTPAY",is_delete_status: false})
    bill.trade_state ="SUCCESS"
    bill.total_fee =total_fee
    bill.time_end =time_end
    bill.bank_type =bank_type
    bill = await bill.save()
}


module.exports = {
    //注册
    async postRenterToken(ctx) {
        // ...
        let {wx_login_code, wx_user_info} = ctx.request.body

        console.log(wx_user_info)
        if (!wx_login_code) {
            throw new ApiError("code不能为空")
        }

        //1.获取openid
        let openid
        await requetWxOpenId(wx_login_code, config.renter_wx.appid, config.renter_wx.secret, res => {
            // console.log(res)
            if (res.errcode) {
                throw new ApiError(res.errmsg, res.errcode)
            }
            // console.log("成功")
            openid = res.openid
        }, err => {
            console.log(err)
            throw err
        })

        //2.保存用户
        let renter = await Renter.findOne({openid: openid});
        if (!renter) {
            //保存该openid，暂时没有加入renter_id，但是是必要的，多平台会好点
            const newRenter = new Renter({
                openid: openid,
                wx_user_info: wx_user_info
            });

            renter = await newRenter.save();
            if (renter.errors) {
                throw new ApiError('数据保存出错')
            } else {
                console.log("保存房客opneId成功")
                console.log(renter)
            }
        }


        //3.获取token，根据renter_id，这里暂定openid生成token，然后保存在登录表里面，返回给用户即可
        let token = geneToken({openid: openid})
        let renterLogin = await RenterLogin.findOne({openid: openid});
        console.log("找到一个登录记录")
        console.log(renterLogin)
        if (renterLogin) {
            renterLogin.token = token
            renterLogin.create_date = new Date()
            renterLogin = await renterLogin.save()
        } else {
            const newRenterLogin = new RenterLogin({
                openid: openid,
                token: token,
                create_date: new Date()
            });
            renterLogin = await newRenterLogin.save()
        }

        if (renterLogin.errors) {
            throw new ApiError('数据保存出错')
        }

        //4.登录成功，返回token
        token = 'Bearer ' + token
        ctx.restSuccess({token: token})
    },

    async putRenterPhone(ctx) {

        let {phone, code} = ctx.request.body

        let openid = ctx.login.openid
        console.log(ctx.request.body)
        //    判断手机号和验证码是否正确
        if (!phone || code !== "123456") {
            throw new ApiError("验证码错误，请重新输入")
        }
        //    用户表判断是否有手机号了
        let renter = await Renter.findOne({openid: openid});
        if (renter.phone) {
            throw new ApiError("该帐号已经绑定手机了")
        }
        renter.phone = phone
        renter = await renter.save()
        if (renter.errors) {
            throw new ApiError('数据保存出错')
        }
        ctx.restSuccess({renter: renter})
    },

    async toGetBook(ctx) {

        let {type} = ctx.request.query
        let openid = ctx.login.openid

        //查找手机号
        let renter = await Renter.findOne({openid: openid});
        let renter_phone = renter.phone

        let books
        if (type === "renter_phone") {
            if (!renter_phone) {
                throw new ApiError('请先绑定手机号')
            }
            books = await Book.find({renter_phone: renter_phone, is_delete_status: false}, {
                is_delete_status: 0,
                __v: 0
            })
        } else {
            books = await Book.find({renter_id: openid, is_delete_status: false}, {is_delete_status: 0, __v: 0})
        }

        //根据账本找房源house_id

        for (let i = 0; i < books.length; i++) {
            console.log("-----")
            let item = books[i].toObject()
            let house = await House.findOne({_id: item.house_id, is_delete_status: false}, {
                openid: 0,
                is_delete_status: 0,
                _id: 0,
                __v: 0
            })
            let rent_month_count = parseInt(item.rent_month_count.split('个月')[0])

            item.rent_end_date = formatTimeYMD(getNextMonth(new Date(item.rent_begin_date),rent_month_count))
            item.rent_begin_date = formatTimeYMD(new Date(item.rent_begin_date))
            item.house = house
            books[i] = item
        }

        ctx.restSuccess({list: books, phone: renter_phone})
    },

    async toPutBookPhone(ctx) {
        let {book_ids} = ctx.request.body
        let openid = ctx.login.openid

        let bind_book_ids = []
        for (let i = 0; i < book_ids.length; i++) {
            let book_id = book_ids[i]
            console.log("~~~~~~~")
            console.log(book_id)
            let book = await Book.findOne({_id: book_id});

            if (!book) {
                // throw new ApiError("没有找到指定的房源（账本）")
            }
            if (book.renter_id) {
                // throw new ApiError("该房源（账本）已经绑定")
            }

            if (book && !book.renter_id) {
                book.renter_id = openid
                book = await book.save()
                if (book.errors) {
                    // throw new ApiError('数据保存出错')
                } else {
                    bind_book_ids.push(book_id)
                }
            }

        }
        ctx.restSuccess({bind_book_ids: bind_book_ids})
    },

    async toGetBillDetail(ctx) {

        console.log("toGetBillDetail--------")
        let {bill_id} = ctx.params

        console.log("bill_id = "+bill_id)
        if(!bill_id){
            throw new ApiError("该账单有错误")
        }

        let bill = await Bill.findOne({_id: bill_id,trade_state:"NOTPAY",is_delete_status: false},{bill_mark:0,__v:0,is_delete_status:0})

        if(!bill){
            throw new ApiError("没有找到该账单或者该账单已完成")
        }


        console.log("sb---requetQueryOrder我去")
        //支付前先差查一下订单的状态
        await requetQueryOrder(bill.out_trade_no,xml=>{
            console.log("---requetQueryOrder我去")
            console.log(xml)

            // let return_code = getXMLNodeValue('return_code', xml)
            // let result_code = getXMLNodeValue('result_code', xml)
            // let trade_state = getXMLNodeValue('trade_state', xml)


            if (getXMLNodeValue('return_code', xml) === 'SUCCESS'&&getXMLNodeValue('result_code', xml) === 'SUCCESS'&&getXMLNodeValue('trade_state', xml) === 'SUCCESS') {
            //    该订单已经支付，记住前提是这个订单是未支付的，因为没有回调成功，导致异常，才要进行这一步，
                let out_trade_no = getXMLNodeValue('out_trade_no', xml)
                let bank_type = getXMLNodeValue('bank_type', xml)
                let total_fee = getXMLNodeValue('total_fee', xml,true)
                let time_end = getXMLNodeValue('time_end', xml)
                orderSuccess(out_trade_no,bank_type,total_fee,time_end)

                throw new ApiError("该账单已经支付，请勿重新付款")
            }else{

                bill = bill.toObject()
                delete bill.out_trade_no
                ctx.restSuccess({bill:bill})
            }



        },err=>{
            console.log("查询订单出错")
            console.log(err)
            throw err
        })

    },


    async toGetWxPayData(ctx) {

        let {bill_id} = ctx.request.query

        console.log("bill_id = "+bill_id)
        if(!bill_id){
            throw new ApiError("该账单有错误")
        }

        let bill = await Bill.findOne({_id: bill_id,trade_state:"NOTPAY",is_delete_status: false})

        if(!bill){
            throw new ApiError("没有找到该账单或者该账单已完成")
        }



        let openid = ctx.login.openid
        let out_trade_no =bill.out_trade_no
        let body = bill.house_name+"-"+bill.title
        let total_fee = bill.total_fee
        console.log(ctx.header.host)

        await requestWxPayData(out_trade_no,body,total_fee,openid, xml => {
            let return_code = getXMLNodeValue('return_code', xml)
            if (return_code !== 'SUCCESS') {
                //通信失败
                let return_msg = getXMLNodeValue('return_msg', xml)
                throw new ApiError(return_msg)
            }
            let result_code = getXMLNodeValue('result_code', xml)
            if (result_code !== "SUCCESS") {
                let err_code_des = getXMLNodeValue('err_code_des', xml)
                throw new ApiError(err_code_des)
            }

            let payData = {
                appId: config.renter_wx.appid,
                nonceStr: wxPay.createNonceStr(),
                package: 'prepay_id=' + getXMLNodeValue('prepay_id', xml),
                signType: 'MD5',
                timeStamp: wxPay.createTimeStamp(),
            }
            payData.paySign = wxPay.paySign(payData, config.wechat.mch_key)

            delete payData.appid
            ctx.restSuccess({payData: payData})

        }, err => {
            console.log("获取支付数据出错")
            throw err
        })


    },


    async toWxNotify(ctx) {
        console.log('这里是微信回调')
        let xml = ctx.request.body?ctx.request.body.xml:""
        if ( xml && xml.return_code&& xml.result_code) {
            //校验签名
            let sign = xml.sign
            delete xml.sign
            let newSign = wxPay.paySign(xml,config.wechat.mch_key)

            if(sign.toString() === newSign.toString()&&xml.return_code.toString()==="SUCCESS"&&xml.result_code.toString()==="SUCCESS"){
                console.log('签名一致----------------------')
                await orderSuccess(xml.out_trade_no,xml.bank_type,xml.total_fee,xml.time_end)

                //这里是返回给微信后台的，表示接受到了该信息
                ctx.response.body = 'SUCCESS'

            }

        }
    },

    async toGetBill(ctx) {

        let {book_id,trade_state} = ctx.request.query

        let openid = ctx.login.openid

        if(book_id){
            //指定了book，获取该book_id下的账单，没有指定就获取全部
        }else{
            let books = await Book.find({renter_id: openid, is_delete_status: false}, {is_delete_status: 0, __v: 0})
            book_id = {"$in":[]}
            for(let i = 0; i < books.length; i++){
                book_id["$in"].push(books[i]._id)
            }
        }


        let bills = await Bill.find({book_id: book_id,trade_state:trade_state||"NOTPAY",is_delete_status: false},{bill_mark:0,__v:0,is_delete_status:0})
        let allBill = []
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
    },



}

// B41188F11FB17290A4207E07896B164B
// B41188F11FB17290A4207E07896B164B
