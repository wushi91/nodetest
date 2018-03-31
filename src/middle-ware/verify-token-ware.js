const jwt = require('koa-jwt')
const AuthError = require('../util/error').AuthError

/*
*
* 这里是token的校验
*
* */
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


