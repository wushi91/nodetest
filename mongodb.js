const mongoose = require('mongoose')
const UserModel = require('./model/Model').UserModel

const mongodbServerUrl = "mongodb://localhost:27017/"

mongoose.connect(mongodbServerUrl,function(err) {
    if(!err){

        var doc1 = new UserModel({ title: 'hell ow orl d',hidden:true });
        doc1.save(function (err,doc) {
            //{ __v: 0, size: 'small', _id: 5970daba61162662b45a24a1 }
            if(err){
                console.log(err)
            }else {
                console.log(doc);
            }

        })
    }


})

//mongoose.disconnect()


