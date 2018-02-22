const APIError = require('../util/restful').APIError
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