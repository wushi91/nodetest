const Koa = require('koa');

//第三方中间层
const logger = require('koa-logger')
const bodyParser = require('koa-bodyparser')
const jwt = require('jsonwebtoken')
const router = require('koa-router')()


//中间层
const error = require('./middle-ware/error-ware')
const restify = require('./middle-ware/restify-ware')
const verityToken = require('./middle-ware/verity-token-ware')

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

//表单解析,可以通过request.body获取post数据
app.use(bodyParser())

// restful api数据返回的格式化 意义一般
app.use(restify())

// token验证
app.use(verityToken())

//根据token寻找用户id

//路由
router.use(htmlRouter.routes());
router.use('/api', apiRouter.routes(), apiRouter.allowedMethods());
app.use(router.routes());


//据说关闭自动索引速度会快一点{ config: { autoIndex: false } }
mongoose.Promise = global.Promise; //连接前加上这句话
mongoose.connect(config.database)
app.listen(3000);

console.log('app started at port 3000...');