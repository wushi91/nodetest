const userInfoController = require('../controller/user-info')
const router = require('koa-router')();



/* url前缀为api的路由*/

const routers = router
    //
    .post('/signup', userInfoController.signUp)
    //
    .post('/signin', userInfoController.signIn)
    //
    .post('/user/accesstoken', userInfoController.accesstoken)





module.exports = routers
    /*
    判断url前缀是否是api，如果是，则设置当前路由，否则舍弃，进行下一步。
    其实如果路由没有进到这里的处理方法，也会自动到下一步，所以我可以不用设置其他*/
