const Koa = require('koa');
const logger = require('koa-logger')
const bodyParser = require('koa-bodyparser');
const apiRouter = require('./router/apiRouter');
const htmlRouter = require('./router/htmlRouter');
const jwt = require('jsonwebtoken')
const verify = require('util').promisify(jwt.verify) // 解密,verifyAsync

var vjwt = require('koa-jwt');
const router = require('koa-router')();
// const restify = require('./util/restful').restify;
const mongoose = require('mongoose')
const config = require('../config')


const app = new Koa();

// log request URL:
// app.use(async (ctx, next) => {
//     console.log(`Process ${ctx.request.method} ${ctx.request.url}...`);
//     await next();
// });

/*
* 错误处理中间层
 */
app.use(async (ctx, next) => {
    try {
        await next();
    } catch (err) {
        console.log(err)
        console.log('错误统一处理中间层')
        // ctx.response.status = 400
        ctx.response.type = 'application/json'
        ctx.response.body = {
            code: err.code || 'internal:unknown_error',
            message: err.message || ''
        }
    }
});

/*
*
 */
app.use(logger())
/*
* 表单解析
*/
app.use(bodyParser());

/*
* restful api数据返回的格式化 意义一般
*/
app.use(async (ctx, next) => {
    if (ctx.request.path.startsWith('/api/')) {
        // 返回结果的时候使用restful方法
        ctx.restSuccess = (data) => {
            ctx.response.type = 'application/json'
            ctx.response.body = data
            ctx.response.body.success = true
        }

        ctx.restFail = (data) => {
            ctx.response.type = 'application/json'
            ctx.response.body = data
            ctx.response.body.success = false
        }

    }
    await next();
})

app.use(async (ctx, next) => {
    console.log("ctx.state")
    console.log(ctx.state)
    await next()
})

app.use(vjwt({ secret: config.secret ,key: 'jwtdata'}).unless({ path: [/^\/apitest/] }));

app.use(async (ctx, next) => {
    console.log("ctx.state.jwtdata")
    console.log(ctx.state.jwtdata)
    await next()
})

/*
* token验证
* */
//这一堆其实可以放到api里面
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

/*
*路由
 */
router.use(htmlRouter.routes());
router.use('/api', apiRouter.routes(), apiRouter.allowedMethods());
app.use(router.routes());


//据说关闭自动索引速度会快一点{ config: { autoIndex: false } }
mongoose.Promise = global.Promise; //连接前加上这句话
mongoose.connect(config.database)
app.listen(3000);

console.log('app started at port 3000...');