
//证书的地址

module.exports = {
    host: "http://localhost:3000",
    database:'mongodb://localhost:27017/test1',//数据库

    //  小程序的appid
    lander_wx:{
        appid:"wx1406e2b3d9a339fd",
        secret:"fe6fc3cd40471d7b74ca46b7e9e2d274",//  密钥，这是向微信后台表明这个小程序真的是我的
    },
    renter_wx:{
        appid:"wx76a45f2fd2e25b1d",
        secret:"b995334388611c4519f1dcbe9a543d08",//  密钥，这是向微信后台表明这个小程序真的是我的
    },

    // mch_wx:{
    //     mch_id:'1487882592',
    //     mch_key:'sunchuanjunzufangzhangben8812345'
    // },
    token:{
        secret:"d63ccad48b8bb6bed856dfc77fdb609e",
        expiresIn:"120d",//24h 7d,这里设置了120天的有效期
    },

    wechat:{
        lander_appid:"wx1406e2b3d9a339fd",
        lander_secret:"fe6fc3cd40471d7b74ca46b7e9e2d274",

        renter_appid:"wx76a45f2fd2e25b1d",
        renter_secret:"b995334388611c4519f1dcbe9a543d08",

        mch_lander_id:'1487882592',
        mch_lander_key:'sunchuanjunzufangzhangben8812345',

        mch_id:'1487882592',
        mch_key:'sunchuanjunzufangzhangben8812345',
        // mch_id:'1492103342',
        // mch_key:'sunchuanjunzufangzhangbenfk88123',
        // mch_id:'1485503632',
        // mch_key:'qingren135SUN1007chuan0453junabc',
        notify_url : 'https://www.0755qr.com/api/notify',
        // 微信支付回调通知支付结果

        // 微信支付是否支持信用卡支付
        limit_pay: 'no_credit',
    },

    alisms:{
        access_key_id:'LTAIzSa9WLkLoVKx',
        secret_access_key:'NfY5ash9mHoXzdGwVn5spLg0VAp63O'
    },
    //不校验token的请求路径
    un_verity_token_path:[
        /^\/apitest/,
        /^\/api\/signup/,
        /^\/api\/user\/accesstoken/,
        /^\/api\/lander\/accesstoken/,
        /^\/api\/renter\/accesstoken/,
        /^\/favicon.ico/,
        /^\/api\/notify/
    ],

    //公测资格的手机号
    gongce_phone:["13822542317","17748674317","13410052773","13510070453"]
//
}