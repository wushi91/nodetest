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
const bcrypt = require('bcrypt')
const UserSchema = new Schema({
    username: {
        type: String,
        // index: {unique: true},
        unique: true,
        require: true
    },
    password: {
        type: String,
        require: true
    },
    token: {
        type: String
    },
    email: {
        type: String,
    }
})


// 添加用户保存时中间件对password进行bcrypt加密,这样保证用户密码只有用户本人知道
UserSchema.pre('save', function (next) {
    //
    // const salt = bcrypt.genSaltSync()
    // const hash = bcrypt.hashSync(user.password, salt)
    var user = this;
    if (this.isModified('password') || this.isNew) {
        bcrypt.genSalt(10, function (err, salt) {
            if (err) {
                return next(err);
            }
            bcrypt.hash(user.password, salt, function (err, hash) {
                if (err) {
                    return next(err);
                }
                user.password = hash;
                next();
            });
        });
    } else {
        return next();
    }
});
// 校验用户输入密码是否正确
// UserSchema.methods.comparePassword = function (passw, cb) {
//     bcrypt.compare(passw, this.password, (err, isMatch) => {
//         if (err) {
//             return cb(err);
//         }
//         cb(null, isMatch);
//     });
// };

// 校验用户输入密码是否正确
UserSchema.methods.comparePassword =  async function (passw) {
    let res = await bcrypt.compare(passw, this.password);
    return res
};
module.exports = mongoose.model('users', UserSchema)
