
//
// const restify = function (pathPrefix) {
//     pathPrefix = pathPrefix || '/api/'
//     return async (ctx, next) => {
//         if (ctx.request.path.startsWith(pathPrefix)) {
//             // 绑定rest()方法:
//             ctx.restful = (data) => {
//                 ctx.response.type = 'application/json'
//                 ctx.response.body = data
//             }
//
//             try {
//                 //进入下一步，通常是api接口处理
//                 await next();
//             } catch (e) {
//                 // 返回错误
//                 ctx.response.status = 400
//                 ctx.response.type = 'application/json'
//                 ctx.response.body = {
//                     code: e.code || 'internal:unknown_error',
//                     message: e.message || ''
//                 }
//             }
//
//         } else {
//             await next()
//         }
//     }
// }

const APIError = function (code, message) {
    this.code = code || 'internal:unknown_error';
    this.message = message || '';
}




module.exports = {
    // restify,
    APIError
}