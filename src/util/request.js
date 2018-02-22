const requestPromise = require('request-promise');
// const request = require('request');
const config = require('../../config');

const get_wx_openid_url = "https://api.weixin.qq.com/sns/jscode2session"

// console.log(data)
// console.log("[openid]", data.openid)
// console.log("[session_key]", data.session_key)
//TODO: 生成一个唯一字符串sessionid作为键，将openid和session_key作为值，存入redis，超时时间设置为2小时
//伪代码: redisStore.set(sessionid, openid + session_key, 7200)
// res.json({ sessionid: sessionid })
// const requetWxOpenId = async (code, success, error)=>{
//     await request.get({
//         uri: get_wx_openid_url,
//         json: true,
//         qs: {
//             grant_type: 'authorization_code',
//             appid: config.appid,
//             secret: config.secret,
//             js_code: code
//         }
//     }, (err, response, data) => {
//         console.log('f f s u c c e s s')
//         if (response.statusCode === 200 && success) {
//             success(data)
//             console.log('s u c c e s s')
//         } else {
//             if (error) error(err)
//         }
//     })
// }

// const http=require('http');
// get 请求外网
const requetWxOpenId = async (code, success, error)=>{
    let options = {
        uri: get_wx_openid_url,
        qs: {
            grant_type: 'authorization_code',
            appid: config.appid,
            secret: config.secret,
            js_code: code
        },
        headers: {
            'User-Agent': 'Request-Promise'
        },
        json: true // Automatically parses the JSON string in the response
    };

    await requestPromise(options)
        .then(res=> {
            if(res.errcode){
                error(res)
            }else{
                success(res)
            }
        })
        .catch(err=> {
            error(err)
        })
}

module.exports = {
    requetWxOpenId
}