const mongoose = require('mongoose')
const config = require('../../config')
const UserModel = require('../model/User')

//据说关闭自动索引速度会快一点
mongoose.connect(config.mongodbServer, { config: { autoIndex: false } })
console.log("ssb")


const saveUser = function () {
    let user = new UserModel({title:'路共产主义的优越性'})
    user.save(function (err) {
        if(err){
            console.log("保存失败")
        }else{
            console.log("保存成功")
        }
    })

    console.log("fehfiwh哈哈哈")
}

saveUser()
//
// mongoose.connect(config.mongodbServer,function(err) {
//     if(!err){
//
//         var doc1 = new UserModel({ title: 'hell ow orl d',hidden:true });
//         doc1.save(function (err,doc) {
//             //{ __v: 0, size: 'small', _id: 5970daba61162662b45a24a1 }
//             if(err){
//                 console.log(err)
//             }else {
//                 console.log(doc);
//             }
//
//         })
//     }
//
//
// })