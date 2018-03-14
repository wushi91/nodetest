


module.exports = {
    host: "http://localhost:3000",
    database:'mongodb://localhost:27017/test1',//数据库


    //不校验token的请求路径
    un_verity_token_path:[
        /^\/apitest/,
        /^\/api\/signup/,
        /^\/api\/user\/accesstoken/,
        /^\/api\/lander\/accesstoken/,
        /^\/api\/renter\/accesstoken/,
        /^\/favicon.ico/,
        /^\/api\/notify/
    ]

}