const Koa = require('koa');

//第三方中间层
const logger = require('koa-logger')
const xmlParser = require('koa-xml-body')
const bodyParser = require('koa-bodyparser')
const jwt = require('jsonwebtoken')
const router = require('koa-router')()


//自定义中间层
const error = require('./middle-ware/error-ware')
const restify = require('./middle-ware/restify-ware')
const verifyToken = require('./middle-ware/verify-token-ware')
const verifyLogin = require('./middle-ware/verify-login-ware')

//路由
const apiRouter = require('./router/api-router')
const htmlRouter = require('./router/html-router')

const mongoose = require('mongoose')
const config = require('../config')


const app = new Koa();

//优化log显示,方便调试
app.use(logger())

// 错误处理中间层
app.use(error())

//微信返回的xml解析
app.use(xmlParser())
// app.use(async (ctx, next) => {
//     console.log("----xmlParser----")
//     console.log(ctx.request.body)
//     await next()
// })
//表单解析,可以通过request.body获取post数据
app.use(bodyParser())

// restful api数据返回的格式化 意义一般
app.use(restify())
//

// token验证，这里是验证token的有效性
app.use(verifyToken(config.token.secret,config.un_verity_token_path))

//登陆验证，判断token是否有对应的用户id(根据token寻找用户id)
app.use(verifyLogin(config.un_verity_token_path))

//需要加入数据权限层，后期记得加入

//路由
router.use(htmlRouter.routes());
router.use('/api', apiRouter.routes(), apiRouter.allowedMethods());
app.use(router.routes());


//据说关闭自动索引速度会快一点{ config: { autoIndex: false } }
mongoose.Promise = global.Promise; //连接前加上这句话
mongoose.connect(config.database)
mongoose.connection.on('error',function (err) {
    console.log('数据库连接出错')
    console.log('mongodb connect error')
});
mongoose.connection.on('connected', function () {
    console.log('数据库连接成功')
    console.log('mongodb connect success')
});

app.listen(3000);

console.log('app started at port 3000...');