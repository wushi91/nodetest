const jwt = require('jsonwebtoken')
const config = require('../../config')


const geneToken = function(name){
    let token = jwt.sign({name: name}, config.secret,{
        //token签名 有效期
        expiresIn: config.tokenExpiresIn
    })
    return token
}

module.exports = {
    geneToken
}
