// const userInfoController = require('../controller/user-info')
const landerInfoController = require('../controller/lander-info')
const router = require('koa-router')();

const lander_path_pre = '/lander'//外部路由已经判断/api前缀了
const renter_path_pre = '/renter'//外部路由已经判断/api前缀了
//
const post_lander_token = lander_path_pre+'/accesstoken'
const to_add_house = lander_path_pre+'/houses'
const to_delete_house = lander_path_pre+'/houses/:house_id'


/* url前缀为api的路由*/

module.exports = router
    .post(post_lander_token,landerInfoController.postLenderToken)
    .post(to_add_house,landerInfoController.toAddHouse)
    /*
    判断url前缀是否是api，如果是，则设置当前路由，否则舍弃，进行下一步。
    其实如果路由没有进到这里的处理方法，也会自动到下一步，所以我可以不用设置其他*/
