const jwt = require('jsonwebtoken')
const config = require('../../config')


const geneToken = function(payload){
    let token = jwt.sign(payload, config.token.secret,{
        //token签名 有效期
        expiresIn: config.token.expiresIn
    })
    return token
}

module.exports = {
    geneToken
}
