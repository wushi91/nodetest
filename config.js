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
    token:{
        secret:"d63ccad48b8bb6bed856dfc77fdb609e",
        expiresIn:"120d",//24h 7d,这里设置了120天的有效期
    },
    //不校验token的请求路径
    un_verity_token_path:[
        /^\/apitest/,
        /^\/api\/signup/,
        /^\/api\/user\/accesstoken/,
        /^\/api\/lander\/accesstoken/,
        /^\/api\/renter\/accesstoken/,
        /^\/favicon.ico/
    ]

}