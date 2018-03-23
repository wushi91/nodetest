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

const CashOrderSchema = new Schema({


    lander_id: {
        type:String,
        require: true
    },

    partner_trade_no:{
        type: String,
        require: true
    },

    //  SUCCESS  :转账成功  FAILED  :转账失败  PROCESSING  :处理中
    status:{
        type: String,
        default:"NOTPAY"
    },

    payment_time:{
        type: String,
    },

    amount:{
        type: Number,
        default:0
    },

    create_date:{
        type:Date,
        default:Date.now
    }


})

module.exports = mongoose.model('cash-orders', CashOrderSchema)
