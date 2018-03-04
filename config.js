module.exports = {


    host: "http://localhost:3000",
    database:'mongodb://localhost:27017/test1',//数据库

    //  小程序的appid
    wx:{
        appid:"wx09909ed7368c1012",
        secret:"d63ccad48b8bb6bed856dfc77fdb609e",//  密钥，这是向微信后台表明这个小程序真的是我的
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
        /^\/api\/lander\/accesstoken/
    ]

}