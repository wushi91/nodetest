const Lander = require('./../model/Lander')
const LanderLogin = require('./../model/LanderLogin')
const House = require('./../model/House')

const ApiError = require('../util/error').ApiError
const AuthError = require('../util/error').AuthError

const geneToken = require('../util/util').geneToken
const requetWxOpenId = require('../util/request').requetWxOpenId

module.exports = {
    //注册
    async postLenderToken(ctx) {
        // ...
        let {wx_login_code, wx_user_info} = ctx.request.body
        if (!wx_login_code) {
            throw new ApiError("code不能为空")
        }

        //1.获取openid
        let openid
        await requetWxOpenId(wx_login_code, res => {
            // console.log(res)
            if (res.errcode) {
                throw new ApiError(res.errmsg, res.errcode)
            }
            // console.log("成功")
            openid = res.openid
        }, err => {
            throw err
        })

        //2.保存用户
        let lander = await Lander.findOne({openid: openid});
        if (!lander) {
            //保存该openid，暂时没有加入lander_id，但是是必要的，多平台会好点
            const newLander = new Lander({
                openid: openid
            });

            lander = await newLander.save();
            if (lander.errors) {
                throw new ApiError('数据保存出错')
            } else {
                console.log("保存房东opneId成功")
                console.log(lander)
            }
        }


        //3.获取token，根据lander_id，这里暂定openid生成token，然后保存在登录表里面，返回给用户即可
        let token = geneToken({openid: openid})
        let landerLogin = await LanderLogin.findOne({openid: openid});
        console.log("找到一个登录记录")
        console.log(landerLogin)
        if (landerLogin) {
            landerLogin.token = token
            landerLogin.create_date = new Date()
            landerLogin = await landerLogin.save()
        } else {
            const newLanderLogin = new LanderLogin({
                openid: openid,
                token: token,
                create_date: new Date()
            });
            landerLogin = await newLanderLogin.save()
        }

        if (landerLogin.errors) {
            throw new ApiError('数据保存出错')
        }

        //4.登录成功，返回token
        token = 'Bearer ' + token
        ctx.restSuccess({token: token})
    },

    async toAddHouse(ctx) {
        let {area, house_name} = ctx.request.body
        if (!house_name) {
            throw new ApiError("房屋名称不能为空")
        }

        let token = ctx.request.header.authorization.split(" ")[1]
        //   1. 数据库中查找token对应的openid，这样可以保证一个用户只有一个token有效
        let landerLogin = await LanderLogin.findOne({token: token})
        let openid
        if (!landerLogin) {
            console.log("身份验证已经失效，请重新登录")
            throw new AuthError("身份验证已经失效，请重新登录")
        }
        openid = landerLogin.openid
        console.log("openid = ====")
        console.log(openid)
        //  2.  需要判断房源的唯一性 openid 和 house_name 和 delete_status= false
        let house = await House.findOne({openid: openid, house_name: house_name, is_delete_status: false})
        if (house) {
            throw new ApiError('该房源已存在')
        }

        //  3. 添加房源
        const newHouse = new House({
            openid:openid,
            area: area,
            house_name: house_name,
            is_delete_status: false
        });
        house = await newHouse.save()
        if (newHouse.errors) {
            throw new ApiError('数据保存出错')
        }

        ctx.restSuccess({house:house})
    }

}