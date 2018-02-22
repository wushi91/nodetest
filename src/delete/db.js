var MongoClient = require('src/delete/mongodb').MongoClient;
var url = "mongodb://localhost:27017/hehe";


/**
 * 连接数据库：MongoClient.connect
 * 创建数据库：db.db("runoob")
 * 创建集合：dbase.createCollection
 * 插入文档：collection.insert()
 * */


MongoClient.connect(url,function(err,db){
    if(!err){
        db.collection("col").insert({"a":1},function(err,result){
            if(!err){
                console.log(result);
            }
        })
    }
})


// MongoClient.connect(url, function (err, db) {
//     if (err) throw err;
//
//     db.collection("col").insert({"a":1},function(err,result){
//         if(!err){
//             console.log(result);
//         }
//         db.close()
//     })
//     // var dbo = db.db("blogtest");
//     // var myobj = { name: "菜鸟教程", url: "www.runoob" };
//     // dbo.collection("sb").find({name:'zhazha'}).toArray(function(err, result){
//     //     console.log(result)
//     //     db.close()
//     // })
//
//     // var whereStr = {"name":'zhazha'};  // 查询条件
//     // var updateStr = {$set: { "gongzi" :1552 }};
//     // dbo.collection("sb").updateOne(whereStr, updateStr, function(err, res) {
//     //     if (err) throw err;
//     //     console.log("文档更新成功");
//     //     db.close();
//     // });
// });