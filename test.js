// console.log('haha')

// async function sleeps() {
//     console.log('begin')
//
//     await timeout()
//
//     console.log('over')
// }


function sleep() {
    console.log('ssss')
    return new Promise((resolve,reject) => {
        console.log('bbbb')
        setTimeout(resolve,2000)
    })
}


// sleep().then(()=>{
//     console.log('sssbbbb')
//
// }).catch(err=>{
//     console.log(err)
// })

async function asyncSleep(){
    await sleep().then(()=>{
        console.log('then')
    })
    console.log('over')
}

asyncSleep()