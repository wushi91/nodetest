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

const LanderLoginSchema = new Schema({
    openid: {
        type: String,
        unique: true,
        require: true
    },
    token:{
        type: String,
        unique: true,
        require: true
    },

    create_date:{
        type:Date
    }


})

module.exports = mongoose.model('lander-logins', LanderLoginSchema)
