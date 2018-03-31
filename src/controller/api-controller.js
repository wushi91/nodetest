const landerInfoController = require('./lander-info')
const renterInfoController = require('./renter-info')

const router = require('koa-router')();
const api = require('../util/api-config')
const BookServer = require('../server/Book')



module.exports = router
    .post(post_lander_token,landerInfoController.postLanderToken)
    .post(to_houses,landerInfoController.toAddHouse)
    .get(to_houses,landerInfoController.toGetHouse)
    .get(to_houses_books,landerInfoController.toGetHouseBook)
    .post(to_houses_books,landerInfoController.toAddBook)
    .post(post_books_bills,landerInfoController.postBookBill)
    // .get(post_books_bills,landerInfoController.toBookBill)
    .get(to_lander_bill,landerInfoController.toGetBill)
    .put(to_lander_bill,landerInfoController.toPutBillClose)
    .delete(to_delete_house,landerInfoController.toDeleteHouse)
    .get(to_book,landerInfoController.toGetBookDetail)
    .delete(to_book,landerInfoController.toDeleteBook)
    .put(to_book,landerInfoController.toPutBookMoney)
    .get(to_lander_accounts,landerInfoController.toGetLanderAccount)
    .put(to_lander_accounts,landerInfoController.toPutLanderAccountBalance)
    .get(to_cashorder,landerInfoController.toGetCashOrders)
    .get(to_cashorder_detail,landerInfoController.toGetCashOrderDetail)
    //租客
