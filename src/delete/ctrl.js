const APIError = require('./restful').APIError
const request = require('../util/request')

const getUser = async (ctx, next) => {
    ctx.restful({
        msg: 123,
        success:true,
        data:{
            name:'胳臂老王',
            de:'有好处'
        }
    });
};

const userLogin = async (ctx, next) => {
   await request.requetWxOpenId(ctx.request.body.code,res=>{
       ctx.restful({
           msg: '登陆成功',
           success:true,
           openid:res.openid
       });
    },res=>{
    //  error
    //    throw new APIError('auth:user_not_found', 'user not found');
       throw new APIError('auth:get_wxopenid_error', '获取微信权限失败');
    })
}

//
// console.log(data)
// // console.log("[openid]", data.openid)
// // console.log("[session_key]", data.session_key)
// let name  = ctx.request.body.name || ''
// let password = ctx.request.body.password || ''
// console.log(`signin with name: ${name}, password: ${password}`);

module.exports = {
    getUser,
    userLogin
}
// const verify = require('util').promisify(jwt.verify) // 解密,verifyAsync
function verity() {
    app.use(async (ctx, next) => {
        if (ctx.request.path.startsWith('/api/')) {
            let bearerToken;
            let bearerHeader = ctx.request.header.authorization
            if (typeof bearerHeader !== 'undefined') {
                let bearer = bearerHeader.split(" ");
                bearerToken = bearer[1];
                let payload
                try {
                    payload = await verify(bearerToken, config.secret)  // 解密payload，获取用户名和ID
                    ctx.payload = payload
                    console.log(`payload: ${payload}`)
                    console.log(payload)
                    // ctx.request.body.token = bearerToken;
                    await next();
                } catch (err) {
                    ctx.response.status = 401

                    console.log('token verify fail: ', err)
                }


            } else {
                ctx.response.status = 403
            }
        } else {
            await next();
        }
    });
}

// log request URL:
// app.use(async (ctx, next) => {
//     console.log(`Process ${ctx.request.method} ${ctx.request.url}...`);
//     await next();
// });


//
// app.use(async (ctx, next) => {
//     console.log("ctx.state.jwtdata")
//     console.log(ctx.state)
//     console.log(ctx.state.jwtdata)
//     if(ctx.state.jwtdata){
//         let data = new Date(ctx.state.jwtdata.exp)
//         console.log(data)
//     }
//
//     await next()
// })