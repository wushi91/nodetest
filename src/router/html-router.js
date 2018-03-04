const router = require('koa-router')();

const fs = require('fs')

function render(page) {
    return new Promise((resolve, reject) => {
        let viewUrl = `./src/view/${page}`
        fs.readFile(viewUrl, "utf-8", (err, data) => {
            if (err) {
                console.log('err')
                reject(err)
            } else {
                console.log('resolve')
                resolve(data)
            }
        })
    })
}

async function getHtml(ctx){

    ctx.response.type = 'html'
    ctx.response.body =await render('apitest.html')
}

const routers = router
    .get('/', ctx => {
        ctx.response.type = 'html'
        ctx.response.body = '<h1>这是首页</h1>'
    })
    .get('/apitest', getHtml)


module.exports = routers
/*
判断url前缀是否是api，如果是，则设置当前路由，否则舍弃，进行下一步。
其实如果路由没有进到这里的处理方法，也会自动到下一步，所以我可以不用设置其他*/
