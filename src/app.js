const Koa = require('koa');

const bodyParser = require('koa-bodyparser');
const apiRouter = require('./router/apiRouter');
const restify = require('./util/restful').restify;
const mongoose = require('mongoose')
const config = require('../config')



const app = new Koa();

// log request URL:
app.use(async (ctx, next) => {
    console.log(`Process ${ctx.request.method} ${ctx.request.url}...`);
    await next();
});


app.use(bodyParser());
app.use(restify());
app.use(apiRouter.routes());

app.use(async (ctx, next) => {
    console.log('index page')
    if (ctx.request.path === '/') {
        ctx.response.body = `<h1>Index</h1>
        <form action="/signup" method="post">
            <p>Name: <input name="name" value="koa"></p>
            <p>Password: <input name="password" type="password"></p>
            <p><input type="submit" value="Submit"></p>
        </form>`;
    } else {
        await next();
    }
});


//据说关闭自动索引速度会快一点
mongoose.connect(config.mongodbServer, { config: { autoIndex: false } })
app.listen(3000);

console.log('app started at port 3000...');