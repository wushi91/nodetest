// console.log('haha')

// async function sleeps() {
//     console.log('begin')
//
//     await timeout()
//
//     console.log('over')
// }


function sleep() {
    console.log('ssss')
    return new Promise((resolve,reject) => {
        console.log('bbbb')
        setTimeout(resolve,2000)
    })
}


// sleep().then(()=>{
//     console.log('sssbbbb')
//
// }).catch(err=>{
//     console.log(err)
// })

// async function asyncSleep(){
//     await sleep().then(()=>{
//         console.log('then')
//     })
//     console.log('over')
// }
//
// // asyncSleep()
//
// let regPath = /^\/apitest/
// let path = '/apites1t1/'
//
// console.log(regPath.test(path))

const createNonceStr = require('./src/util/pay-util').createNonceStr
// const createTimeStamp = require('./src/util/wx-pay').createTimeStamp
// const createBodyData = require('./src/util/wx-pay').createBodyData
const createOrderNum = require('./src/util/pay-util').createOrderNum

// 对Date的扩展，将 Date 转化为指定格式的String
// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
// 例子：
// (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
// (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18


//订单号
console.log('订单号是：')
console.log(createOrderNum())

console.log(Math.random().toString().substr(2,5))
// console.log(('pro_wxpay' + Math.floor((Math.random()*10000000)+1)))


// console.log('测试结果是：')
// console.log(createNonceStr())
// console.log(createTimeStamp())
// console.log(createBodyData())
// console.log(Date.now())
// console.log(Date.now())