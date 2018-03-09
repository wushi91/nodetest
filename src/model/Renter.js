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

const RenterSchema = new Schema({
    openid: {
        type: String,
        unique: true,
        require: true
    },
    phone: {
        type: String,

    },
    wx_user_info:{
        type:Object
    }

})

module.exports = mongoose.model('renters', RenterSchema)
