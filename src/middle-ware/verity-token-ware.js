const jwt = require('koa-jwt')
const config = require('../../config')
const AuthError = require('../util/error').AuthError
//
// module.exports = verify({
//     secret: config.token.secret, key: 'jwtdata'}).unless({path: [/^\/apitest/]})

//不进行权限校验的路径
//不以/api/开头的所有路径
//另/api/signup和/api/user/accesstoken



async function verity(ctx,next){
    await jwt({
        secret: config.token.secret, key: 'jwtdata'
    }).unless({path: config.un_verity_token_path})(ctx,next)
}



module.exports = ()=>{
    return async (ctx,next)=>{
        try {
            await verity(ctx,next)
        } catch (err) {
            //这个表示的是有jwt模块抛出的异常

            // console.log(err)
            // console.log('cssss---')
            // console.log(err.name)

            if(err&&err.name==='UnauthorizedError'){
                throw new AuthError()
            }else{
                throw err
            }


            // console.log('cssss---')
            // console.log(err.message)

            // console.log(err.originalError)
            // console.log(err.originalError.message)
        }
    }

}

