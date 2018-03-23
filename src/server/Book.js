
const Book = require('./../model/Book')

//如何解决这个问题，请求账本的同时要返回房源的数据，请求账本的时候，房东返回的数据和房客的数据不同，房客请求账本也有两个不同的接口。
//请求房源的账本，books?house_id=""&
module.exports = {

    POST : async function (ctx) {
        // 账本是房源下的，所以需要有房源的id，同时要判定该房源是否存在账本了。即获取根元素，是否判断创建的条件，加入数据属性

        let openid = ctx.login.openid
        let {house_id, renter_phone, renter_name, rent_begin_date, rent_month_count, pay_in_day, pay_month_count, money_secure, money_per_month} = ctx.request.body

        let hasbook = await Book.findOne({house_id: house_id, is_delete_status: false})
        if (hasbook) {
            throw new ApiError('该房源已经绑定租客（账本）')
        }

        let newBook = new Book({
            house_id, renter_phone, renter_name, rent_begin_date, rent_month_count, pay_in_day, pay_month_count, money_secure, money_per_month,
            is_delete_status: false
        });
        newBook = await newBook.save()
        if (newBook.errors) {
            throw new ApiError('数据保存出错')
        }
        ctx.restSuccess({book:newBook})
    },

    GET : async function (ctx) {
        // 1.根据lander_id获取账本，首先要获取lander下的房源，然后再去找房源下的账本，数据结构是house:{book:{}}
        let openid = ctx.login.openid
        let houses = await House.find({openid: openid, is_delete_status: false},{openid:1,house_name:1,area:1})


        // let houses = await House.find({openid: openid, is_delete_status: false},{openid:1,house_name:1,area:1})
        // let house_id = {"$in":[]}
        // for(let i = 0; i < houses.length; i++){
        //     house_id["$in"].push(houses[i]._id)
        // }
        //
        // let books = await Book.find({house_id: house_id, is_delete_status: false},{is_delete_status: 0, __v: 0})
        // book_id = {"$in":[]}
        // for(let i = 0; i < books.length; i++){
        //     book_id["$in"].push(books[i]._id)
        // }


        for(let i =0;i<houses.length;i++){
            let item = houses[i].toObject()
            let book = await Book.findOne({house_id: item._id, is_delete_status: false})

            //还要给有renter_id的找头像，这个book有可能是空的
            if(book&&book.renter_id){
                let renter = await Renter.findOne({openid: book.renter_id})
                if(renter){
                    book = book.toObject()
                    book.user_image =renter.wx_user_info.avatarUrl
                }
            }
            item.book = book
            houses[i] = item
        }

        ctx.restSuccess({list:houses})
    },

    PUT : async function (ctx) {

        let {book_ids} = ctx.request.body
        let openid = ctx.login.openid

        let bind_book_ids = []
        for (let i = 0; i < book_ids.length; i++) {
            let book_id = book_ids[i]
            console.log("~~~~~~~")
            console.log(book_id)
            let book = await Book.findOne({_id: book_id});

            // if (!book) {
            //     // throw new ApiError("没有找到指定的房源（账本）")
            // }
            // if (book.renter_id) {
            //     // throw new ApiError("该房源（账本）已经绑定")
            // }

            if (book && !book.renter_id) {
                book.renter_id = openid
                book = await book.save()
                if (book.errors) {
                    // throw new ApiError('数据保存出错')
                } else {

                    //
                    await geneBill(book)
                    bind_book_ids.push(book_id)
                }
            }

        }
        ctx.restSuccess({bind_book_ids: bind_book_ids})
    },

    DELETE : async function (ctx) {
        let {book_id} = ctx.params
        if(!book_id||book_id==="undefined"){
            throw new ApiError('没有找到该账本')
        }
        let book = await Book.findOne({_id: book_id, is_delete_status: false})
        if(!book){
            throw new ApiError('没有找到该账本')
        }

        book.is_delete_status = true
        book = await book.save();
        if (book.errors) {
            throw new ApiError('数据保存出错')
        }
        ctx.restSuccess({book:book})
    },

}