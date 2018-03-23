const jwt = require('koa-jwt')
const AuthError = require('../util/error').AuthError


module.exports = (secret,unless)=>{
    return async (ctx,next)=>{
        try {
            await jwt({
                secret: secret||"", key: 'jwtdata'
            }).unless({path: unless||[]})(ctx,next)
        } catch (err) {
            //这个表示的是有jwt模块抛出的异常
            if(err&&err.name==='UnauthorizedError'){
                throw new AuthError("请重新登录")
            }else{
                throw err
            }
        }
    }

}

//
// module.exports = verify({
//     secret: config.token.secret, key: 'jwtdata'}).unless({path: [/^\/apitest/]})

//不进行权限校验的路径
//不以/api/开头的所有路径
//另/api/signup和/api/user/accesstoken



// const verify = (secret)=>{
//     return async (ctx,next)=>{
//         try {
//             await jwt({
//                 secret: secret, key: 'jwtdata'
//             }).unless({path: []})(ctx,next)
//         } catch (err) {
//             //这个表示的是有jwt模块抛出的异常
//             if(err&&err.name==='UnauthorizedError'){
//                 throw new AuthError()
//             }else{
//                 throw err
//             }
//         }
//     }
// }




// module.exports = {
//     verify
// }

