const jwt = require('jsonwebtoken')

const  config= require('../../config')

const formatTime = date => {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = date.getHours()
    const minute = date.getMinutes()
    const second = date.getSeconds()

    return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}


const formatTimeYMD = date => {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    // const hour = date.getHours()
    // const minute = date.getMinutes()
    // const second = date.getSeconds()

    return [year, month, day].map(formatNumber).join('/')
}

const formatNumber = n => {
    n = n.toString()
    return n[1] ? n : '0' + n
}


const geneToken = function(payload){
    let token = jwt.sign(payload, config.token.secret,{
        //token签名 有效期
        expiresIn: config.token.expiresIn
    })
    return token
}



const getNextMonth =  (dateIn, length)=>{

    let date = new Date(dateIn)
    if(length===0)
        return date

    let yy = date.getFullYear()
    let mm = date.getMonth()
    let dd = date.getDate()

    let nm = 0//目标月份
    nm = mm + length
    let nd = 0//目标天数
    if (monthDay(yy, nm + 1) < dd) {
        nd = monthDay(yy, nm + 1)
    } else {
        nd = dd - 1
    }
    date.setDate(1)
    date.setMonth(nm)
    date.setDate(nd)
    return date
}

const monthDay =  function (year, month) {
    month = parseInt(month, 10);
    var d = new Date(year, month, 0);  //这个是都可以兼容的
    var date = new Date(year + "/" + month + "/0")   //IE浏览器可以获取天数，谷歌浏览器会返回NaN
    return d.getDate();
}

module.exports = {
    geneToken,
    getNextMonth,
    formatTime,
    formatTimeYMD
}
