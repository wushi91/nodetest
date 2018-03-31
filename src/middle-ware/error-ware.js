


/*
*
* 错误处理中间层
*
* */

module.exports = ()=>{
    return async (ctx,next)=>{
        try {
            await next()
        } catch (err) {
            ctx.status = err.status ||400
            ctx.type = 'application/json'
            ctx.body = {
                code: err.code || 'internal:unknown_error',
                message: err.message || ''
            }
        }
    }

}