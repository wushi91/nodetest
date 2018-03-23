/*
*
* 定义Schema非常简单，指定字段名和类型即可，支持的类型包括以下8种
* String      字符串
* Number      数字
* Date        日期
* Buffer      二进制
Boolean     布尔值
Mixed       混合类型
ObjectId    对象ID
Array       数组

*/

const mongoose = require('mongoose')
const Schema = mongoose.Schema
const wxPay = require('../util/pay-util')

const BillSchema = new Schema({


    book_id: {
        type:Schema.Types.ObjectId,
        require: true
    },

    //这里表示的是这个订单是账本的第几个账单
    bill_mark: {
        type: String,
    },

    //订单号，按照微信支付的接口
    out_trade_no:{
        type:String,
        require:true
    },

    // //商品内容，按照微信支付的接口
    // body:{
    //     type:String,
    //     require:true
    // },

    house_name:{
        type:String,
        require:true
    },
    title:{
        type:String,
        require:true
    },
    pay_in_day: {
        type: String,
    },
    start_date:{
        type:String,
        require:true
    },

    over_date:{
        type:String,
        require:true
    },

    //商品详情，按照微信支付的接口
    // detail: {
    //     type: String,
    // },

    //订单金额，按照微信支付的接口
    total_fee: {
        type: String,
    },

    //按照微信支付的接口
    bank_type: {
        type: String,
    },
    //SUCCESS—支付成功，REFUND—转入退款，NOTPAY—未支付，CLOSED—已关闭，REVOKED—已撤销（刷卡支付），USERPAYING--用户支付中，PAYERROR，按照微信支付的接口
    trade_state: {
        type: String,
        default:"NOTPAY"
    },

    //交易时间，按照微信支付的接口
    time_end: {
        type: String,
    },

    is_delete_status:{
        type:Boolean,
        default:false
    },

    //用户手动关闭才会有的信息
    close_info: {
        type: Object,
    },

})

module.exports = mongoose.model('bills', BillSchema)
