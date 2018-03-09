// const userInfoController = require('../controller/user-info')
const landerInfoController = require('../controller/lander-info')
const renterInfoController = require('../controller/renter-info')

const router = require('koa-router')();

const lander_path_pre = '/lander'//外部路由已经判断/api前缀了
const renter_path_pre = '/renter'//外部路由已经判断/api前缀了

//房东
const post_lander_token = lander_path_pre+'/accesstoken'
const to_houses = lander_path_pre+'/houses'
const to_delete_house = lander_path_pre+'/houses/:house_id'
const to_houses_books = lander_path_pre + '/houses/books'


// 房客
const post_renter_token = renter_path_pre+'/accesstoken'
const put_renter_phone = renter_path_pre+'/phone'
const to_renter_books = renter_path_pre + '/books'
/* url前缀为api的路由*/

module.exports = router
    .post(post_lander_token,landerInfoController.postLanderToken)
    .post(to_houses,landerInfoController.toAddHouse)
    .get(to_houses,landerInfoController.toGetHouse)
    .get(to_houses_books,landerInfoController.toGetHouseBook)
    .post(to_houses_books,landerInfoController.toAddBook)

    //租客
    .post(post_renter_token,renterInfoController.postRenterToken)
    .put(put_renter_phone,renterInfoController.putRenterPhone)
    .get(to_renter_books,renterInfoController.toGetBook)
    .put(to_renter_books,renterInfoController.toPutBookPhone)
    /*
    判断url前缀是否是api，如果是，则设置当前路由，否则舍弃，进行下一步。
    其实如果路由没有进到这里的处理方法，也会自动到下一步，所以我可以不用设置其他*/
