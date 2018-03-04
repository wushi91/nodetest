

const ApiError = function ( message,code) {
    //400
    this.code = code || 'internal:unknown_error';
    this.message = message || '参数出错';
}

const AuthError = function (message,status,code) {
    //401
    this.status = status||401
    this.code = code || 'auth:Unauthorized ';
    this.message = message || '认证失败';
}



module.exports = {
    ApiError,
    AuthError
}