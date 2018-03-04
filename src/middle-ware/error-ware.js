
module.exports = ()=>{
    return async (ctx,next)=>{
        try {
            // console.log(sb)
            await next()
        } catch (err) {
            ctx.status = err.status ||400
            ctx.type = 'application/json'
            ctx.body = {
                code: err.code || 'internal:unknown_error',
                message: err.message || ''
            }
            // ctx.response.status = 400
            // ctx.response.type = 'application/json'
            // ctx.response.body = {
            //     code: err.code || 'internal:unknown_error',
            //     message: err.message || ''
            // }
        }
    }

}