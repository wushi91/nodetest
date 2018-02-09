const APIError = require('./rest').APIError;

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

    let name  = ctx.request.body.name || ''
    let password = ctx.request.body.password || ''
    console.log(`signin with name: ${name}, password: ${password}`);

    if (name === 'koa' && password === '12345') {
        ctx.restful({
            msg: '登陆成功',
            success:true,
        });
    } else {
        throw new APIError('auth:user_not_found', 'user not found');
    }
};


module.exports = {
    getUser,
    userLogin
}