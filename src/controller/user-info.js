const User = require('./../model/user')
const APIError = require('../util/restful').APIError
const util = require('../util/util')

module.exports = {
    //注册
    async signUp(ctx) {
        // ...
        let {name, password, email} = ctx.request.body


        //判断用户名或密码是否为空
        console.log(name)
        console.log(password)
        if (!password) {
            ctx.restFail({message: '请填写用户名和密码'})
        } else {
            //判断该用户名是否已经存在
            let user = await User.findOne({username: name})
            if (user) {
                ctx.restFail({message: '用户名已存在'})
            } else {

                let doc = await new User({username: name, password: password, email: email}).save()
                if (!doc.errors) {
                    ctx.restSuccess({message: '注册成功'})
                } else {
                    ctx.restFail({message: '注册失败'})
                }


            }
        }
        // let user =
        //
        // try{
        //     let sb = await user.save()
        //     if (!sb.errors) {
        //
        //         ctx.restful({
        //             msg: '注册成功',
        //             success:true
        //         });
        //         console.log('保存成功')
        //
        //     } else {
        //         console.log('保存失败')
        //         ctx.body = result;
        //     }
        //     console.log('sbsbsb')
        // }catch (err){
        //     console.log(err)
        //     throw new APIError('server error', '用户保存出错');
        // }
        // err=>{
        //     if(err){
        //         console.log('保存失败')
        //         ctx.body ={sb:'保存失败'}
        //     }else{
        //         console.log('保存成功')
        //         ctx.body ={sb:'保存成功'}
        //     }
        // }

    },

    // async signUp (ctx) {
    //
    //     let result = {
    //         success: false,
    //         message: '注册失败'
    //     };
    //     const { username, email, password } = ctx.request.body;
    //
    //     if (!username && !password) {
    //         result.message = '请填写用户名和密码';
    //         ctx.body = result;
    //     } else {
    //         let user = await User.findOne({username});
    //         //检查用户名是否已存在
    //         if(!user) {
    //             const newUser = new User({
    //                 username: username,
    //                 password: password,
    //                 email: email,
    //             });
    //
    //             const doc = await newUser.save();
    //             if (!doc.errors) {
    //                 ctx.body = {success: true, message: '注册成功'}
    //             } else {
    //                 ctx.body = result;
    //             }
    //             // 下面会代码执行时，会直接先跳过save的回掉处理，路由返回404，再执行err回掉，原因暂不清楚
    //             // await newUser.save(err => {
    //             //     if (err) {
    //             //         ctx.body = result;
    //             //     } else {
    //             //         ctx.body = {success: true, message: '注册成功'}
    //             //     }
    //             // })
    //         } else {
    //             ctx.body = { success: false, message: '用户名已存在'};
    //         }
    //     }
    // },


    //登陆

    async signIn(ctx) {
        let {name, password} = ctx.request.body

        let user = await User.findOne({username: name})

        if (!user) {
            ctx.restFail({message: '用户不存在!'})
        } else {
            // 检查密码是否正确
            let isMatch = await user.comparePassword(password)
            if (isMatch) {
                ctx.restSuccess({message: '登入成功'})
            } else {
                ctx.restFail({message: '密码错误'})
            }
        }
    },


    async accesstoken(ctx) {

        let {name, password} = ctx.request.body

        let user = await User.findOne({username: name})

        if (!user) {
            ctx.restFail({message: '用户不存在!'})
        } else {
            // 检查密码是否正确
            let isMatch = await user.comparePassword(password)
            if (isMatch) {

                let token = util.geneToken(user.username)
                //保存该token到数据库
                user.token = token
                let doc = await user.save()
                if (!doc.errors) {
                    ctx.restSuccess({
                        message: '验证成功!',
                        token: 'Bearer ' + token,
                        name: user.username
                    })
                } else {
                    ctx.restFail({message: '认证失败，未知错误user-info'})
                }

            } else {
                ctx.restFail({message: '密码错误'})
            }


        }

    }


    // async signIn (ctx) {
    //     let result = {
    //         success: false,
    //         message: '用户不存在'
    //     };
    //     //从请求体中获得参数
    //     const username = ctx.request.body.name
    //     const password = ctx.request.body.password
    //     //检查数据库中是否存在该用户名
    //     await User.findOne({
    //         username
    //     }, (err, user) => {
    //         if (err) {
    //             throw err;
    //         }
    //         if (!user) {
    //             ctx.body = result;
    //         } else {
    //             //判断密码是否正确
    //             if (password === user.password) {
    //                 ctx.body = {success: true, message: '登入成功'}
    //             } else {
    //                 ctx.body = {success: false, message: '密码错误'}
    //             }
    //         }
    //     })
    // }
}