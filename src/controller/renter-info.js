const Renter = require('./../model/Renter')
const RenterLogin = require('./../model/RenterLogin')
const Book = require('./../model/Book')
const House = require('./../model/House')

const config = require('../../config')

const ApiError = require('../util/error').ApiError
const AuthError = require('../util/error').AuthError

const geneToken = require('../util/util').geneToken
const requetWxOpenId = require('../util/request').requetWxOpenId
const requestWxPayData = require('../util/request').requestWxPayData
const getXMLNodeValue = require('../util/xml-util').getXMLNodeValue
const wxPay = require('../util/pay-util')

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

    async toGetWxPayData(ctx) {

        let openid = ctx.login.openid

        console.log("开始支付")
        console.log(ctx.header.host)
        console.log(ctx.header.host.match(/\d+.\d+.\d+.\d+/)[0])
        await requestWxPayData(openid, xml => {
            console.log("成功返回")
            console.log(xml)
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
                appId: config.lander_wx.appid,
                nonceStr: wxPay.createNonceStr(),
                package: 'prepay_id=' + getXMLNodeValue('prepay_id', xml),
                signType: 'MD5',
                timeStamp: wxPay.createTimeStamp(),
            }
            payData.paySign = wxPay.paySign(payData, config.wechat.mch_key)

            ctx.restSuccess({payData: payData})

        }, err => {
            console.log("出错返回")
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
            if(sign.toString() === newSign.toString()){
                ctx.response.body = 'SUCCESS'
                console.log('订单号为:' + ctx.request.body.xml.out_trade_no)
            }
        }
    }


}

// B41188F11FB17290A4207E07896B164B
// B41188F11FB17290A4207E07896B164B
