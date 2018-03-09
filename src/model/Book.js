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

const BookSchema = new Schema({
    house_id: {
        type:Schema.Types.ObjectId,
        require: true
    },

    renter_id:{
        type:String,
    },

    renter_phone:{
        type:String,
        require:true
    },

    renter_name: {
        type: String,
    },

    rent_begin_date: {
        type: String,
        default:Date.now()
    },

    rent_month_count: {
        type: String,

    },

    pay_in_day: {
        type: String,
        default:"1",
    },

    pay_month_count: {
        type: String,
        default:1,
    },

    money_secure: {
        type: String,
    },

    money_per_month: {
        type: String,
    },

    is_delete_status:{
        type:Boolean,
        default:false
    }

})

module.exports = mongoose.model('books', BookSchema)
