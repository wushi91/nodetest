module.exports = () => {
    return async (ctx, next) => {
        if (ctx.request.path.startsWith('/api/')) {
            // 返回结果的时候使用restful方法
            ctx.restSuccess = (data) => {
                ctx.response.type = 'application/json'
                ctx.response.body = data
                ctx.response.body.success = true
            }

            ctx.restFail = (data) => {
                ctx.response.type = 'application/json'
                ctx.response.body = data
                ctx.response.body.success = false
            }

        }
        await next();
    }

}