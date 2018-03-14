const APIError = require('./restful').APIError
const request = require('../util/request')

const getUser = async (ctx, next) => {
    ctx.restful({
        msg: 123,
        success:true,
        data:{
            name:'胳臂老王',
            de:'有好处'
        }
    });
};

const userLogin = async (ctx, next) => {
   await request.requetWxOpenId(ctx.request.body.code,res=>{
       ctx.restful({
           msg: '登陆成功',
           success:true,
           openid:res.openid
       });
    },res=>{
    //  error
    //    throw new APIError('auth:user_not_found', 'user not found');
       throw new APIError('auth:get_wxopenid_error', '获取微信权限失败');
    })
}

//
// console.log(data)
// // console.log("[openid]", data.openid)
// // console.log("[session_key]", data.session_key)
// let name  = ctx.request.body.name || ''
// let password = ctx.request.body.password || ''
// console.log(`signin with name: ${name}, password: ${password}`);

module.exports = {
    getUser,
    userLogin
}
// const verify = require('util').promisify(jwt.verify) // 解密,verifyAsync
function verity() {
    app.use(async (ctx, next) => {
        if (ctx.request.path.startsWith('/api/')) {
            let bearerToken;
            let bearerHeader = ctx.request.header.authorization
            if (typeof bearerHeader !== 'undefined') {
                let bearer = bearerHeader.split(" ");
                bearerToken = bearer[1];
                let payload
                try {
                    payload = await verify(bearerToken, config.secret)  // 解密payload，获取用户名和ID
                    ctx.payload = payload
                    console.log(`payload: ${payload}`)
                    console.log(payload)
                    // ctx.request.body.token = bearerToken;
                    await next();
                } catch (err) {
                    ctx.response.status = 401

                    console.log('token verify fail: ', err)
                }


            } else {
                ctx.response.status = 403
            }
        } else {
            await next();
        }
    });
}

// log request URL:
// app.use(async (ctx, next) => {
//     console.log(`Process ${ctx.request.method} ${ctx.request.url}...`);
//     await next();
// });


//
// app.use(async (ctx, next) => {
//     console.log("ctx.state.jwtdata")
//     console.log(ctx.state)
//     console.log(ctx.state.jwtdata)
//     if(ctx.state.jwtdata){
//         let data = new Date(ctx.state.jwtdata.exp)
//         console.log(data)
//     }
//
//     await next()
// })



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



// paysignjs: function (appid, nonceStr, package, signType, timeStamp, key) {
//     let ret = {
//         appId: appid,
//         nonceStr: nonceStr,
//         package: package,
//         signType: signType,
//         timeStamp: timeStamp
//     };
//     let string = raw(ret);
//     string = string + '&key=' + key;
//     let sign = crypto.createHash('md5').update(string, 'utf8').digest('hex');
//     return sign.toUpperCase();
// },
//
// paysignjsapi: function (appid, body, mch_id, nonce_str, notify_url, openid, out_trade_no, spbill_create_ip, total_fee, trade_type, key) {
//     let ret = {
//         appid: appid,
//         body: body,
//         mch_id: mch_id,
//         nonce_str: nonce_str,
//         notify_url: notify_url,
//         openid: openid,
//         out_trade_no: out_trade_no,
//         spbill_create_ip: spbill_create_ip,
//         total_fee: total_fee,
//         trade_type: trade_type
//     };
//     let string = raw(ret);
//     string = string + '&key=' + key; //key为在微信商户平台(pay.weixin.qq.com)-->账户设置-->API安全-->密钥设置
//
//     let sign = crypto.createHash('md5').update(string, 'utf8').digest('hex');
//     return sign.toUpperCase();
// },

//
//
// createBodyData: function (appid, body, mch_id, nonce_str, notify_url, openid, out_trade_no, spbill_create_ip, total_fee, trade_type, sign) {
//     let bodyData = '<xml>';
//     bodyData += '<appid>' + appid + '</appid>';  // 小程序ID
//     bodyData += '<body>' + body + '</body>'; // 商品描述
//     bodyData += '<mch_id>' + mch_id + '</mch_id>'; // 商户号
//     bodyData += '<nonce_str>' + nonce_str + '</nonce_str>'; // 随机字符串
//     bodyData += '<notify_url>' + notify_url + '</notify_url>'; // 支付成功的回调地址
//     bodyData += '<openid>' + openid + '</openid>'; // 用户标识
//     bodyData += '<out_trade_no>' + out_trade_no + '</out_trade_no>'; // 商户订单号
//     bodyData += '<spbill_create_ip>' + spbill_create_ip + '</spbill_create_ip>'; // 终端IP
//     bodyData += '<total_fee>' + total_fee + '</total_fee>'; // 总金额 单位为分
//     bodyData += '<trade_type>'+ trade_type +'</trade_type>'; // 交易类型 小程序取值如下：JSAPI
//     bodyData += '<sign>' + sign + '</sign>';
//     bodyData += '</xml>';
//
//     return bodyData
// },
