
const AuthError = require('../util/error').AuthError
const RenterLogin = require('./../model/RenterLogin')
const LanderLogin = require('./../model/LanderLogin')


function unlessPath(ctx,paths) {
    for(let i=0;i<paths.length;i++){
        if(paths[i].test(ctx.request.path)){
            return true
        }
    }
    return false
}

/*
*
* 每个api请求都带有token，需要判断token对应的登陆状态是否有效
*
* */


module.exports = (unless)=>{
    return async (ctx,next)=>{
        if(unlessPath(ctx,unless)){
        }else{
            //根据对应的token表寻找openid
            let token = ctx.request.header.authorization?ctx.request.header.authorization.split(" ")[1]:""
            let loginStatus
            if(ctx.request.path.startsWith('/api/lander/')){
                loginStatus = await LanderLogin.findOne({token: token})
            }else if(ctx.request.path.startsWith('/api/renter/')){
                loginStatus = await RenterLogin.findOne({token: token})
            }

            if(!loginStatus){
                throw new AuthError("请重新登录")
            }
            ctx.login= {openid :loginStatus.openid}
        }

        await next()

    }

}