

const ApiError = function (code, message) {
    //403
    this.code = code || 'internal:unknown_error';
    this.message = message || '参数出错';
}

const AuthError = function (code, message) {
    //401
    this.status = 401
    this.code = code || 'auth:Unauthorized ';
    this.message = message || '认证失败';
}