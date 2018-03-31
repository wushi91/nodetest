
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const UserSchema = new Schema({
    name: {
        type: String,
        // unique: true,
        required: true,
        maxlength:[11, '手机号长度有误'],
        minlength:11,
        match:[/^a/, '{VALUE}错错是我的错'],
        message: '{VALUE} 长度有误!',//VALUE代表phone存放的值
        index:true
    },
    phone: {
        type: String,
        required: [true, '手机号不能为空'],
        index:true

    },

    sexy: {
        type: String,
        enum: ['man', 'woman'],
        index:true
    },

    // sb:{
    //     type: String,
    //     require: true,
    // }


},{
    // versionKey: false,//去掉版本锁 __v0

    timestamps: { createdAt: 'createTime', updatedAt: 'updateTime' }//自动管理修改时间

})

module.exports = mongoose.model('users', UserSchema)
