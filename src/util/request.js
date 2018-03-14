const requestPromise = require('request-promise');

// const request = require('request');


const get_wx_openid_url = "https://api.weixin.qq.com/sns/jscode2session"
//统一下单地址，获取预支付订单id
const get_wx_pay_data_url = "https://api.mch.weixin.qq.com/pay/unifiedorder"

// get 请求外网
const requetWxOpenId = async (code,appid,secret,success, error)=>{
    let options = {
        uri: get_wx_openid_url,
        qs: {
            grant_type: 'authorization_code',
            appid: appid,
            secret: secret,
            js_code: code
        },
        headers: {
            'User-Agent': 'Request-Promise'
        },
        json: true // Automatically parses the JSON string in the response
    };

    await requestPromise(options)
        .then(success)
        .catch(error)
}

//
// //post请求
// const requestWxPayData = async (appid,mch_id,mch_key,nonce_str,openid,success,error)=>{
//
//     let trade_type = "JSAPI"// 交易类型 小程序取值如下：JSAPI
//     let total_fee =1
//     let spbill_create_ip='192.168.3.11'// 获取客户端ip
//     let out_trade_no = '201803141144001'// 商户订单号
//     let notify_url = 'https://48fca531.ngrok.io/api/notify'
//     let body ='微信支付-test-by-wls'
//     let sign = wxPay.paysignjsapi      (appid, body, mch_id, nonce_str, notify_url, openid, out_trade_no, spbill_create_ip, total_fee, trade_type, mch_key)
//     let bodyData = wxPay.createBodyData(appid, body, mch_id, nonce_str, notify_url, openid, out_trade_no, spbill_create_ip, total_fee, trade_type, sign)
//
//
//     //支付需要的参数
//
//
//
//     let options = {
//         method: 'POST',
//         uri: get_wx_pay_data_url,
//         body: bodyData,
//         json: false // Automatically stringifies the body to JSON
//     };
//
//
//     await requestPromise(options)
//         .then(success)
//         .catch(error)
// }


const wxPay = require('./pay-util')
const wechat = require('../../config').wechat
const createNonceStr = require('./pay-util').createNonceStr
const createOrderNum = require('./pay-util').createOrderNum
const paySign = require('./pay-util').paySign
const getXmlFormat = require('./pay-util').getXmlFormat
//post请求
const requestWxPayData = async (openid,success,error)=>{

    // let trade_type = "JSAPI"// 交易类型 小程序取值如下：JSAPI
    // let total_fee =1
    // let spbill_create_ip='192.168.3.11'// 获取客户端ip
    // let out_trade_no = '201803141427001'// 商户订单号
    // let notify_url = 'https://48fca531.ngrok.io/api/notify'
    // let body ='微信支付-test-by-wls'
    // let sign = wxPay.paysignjsapi      (appid, body, mch_id, nonce_str, notify_url, openid, out_trade_no, spbill_create_ip, total_fee, trade_type, mch_key)
    // let bodyData = wxPay.createBodyData(appid, body, mch_id, nonce_str, notify_url, openid, out_trade_no, spbill_create_ip, total_fee, trade_type, sign)


    //支付需要的参数

    let body = "小程序支付功能测试"
    let spbillId = "127.0.0.1"
    let order ={
        appid: wechat.lander_appid,
        mch_id: wechat.mch_id, //微信支付商户号
        notify_url: wechat.notify_url, //回调函数
        out_trade_no: createOrderNum(), //订单号
        body: body, // 商品内容，支付内容
        openid: openid,
        spbill_create_ip: spbillId , //客户端ip
        trade_type: 'JSAPI',
        total_fee: 1, //支付金额，单位分
        nonce_str: createNonceStr(),
        limit_pay: wechat.limit_pay, //是否支付信用卡支付
    }

    order.sign = paySign(order,wechat.mch_key)

    let xmlData = getXmlFormat(order)



    let options = {
        method: 'POST',
        uri: get_wx_pay_data_url,
        body: xmlData,
        json: false // Automatically stringifies the body to JSON
    };


    await requestPromise(options)
        .then(success)
        .catch(error)
}


module.exports = {
    requetWxOpenId,requestWxPayData
}