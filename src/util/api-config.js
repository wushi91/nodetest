

const lander_pre = '/lander'//外部路由已经判断/api前缀了
const renter_pre = "/renter"


const lander ={
    accesstoken:lander_pre+'/accesstoken',
    houses:lander_pre+'/houses',
    house_id:lander_pre+'/houses/:house_id',
    books:lander_pre+'/books',
    book_id:lander_pre+'/books/:book_id',
    bills:lander_pre+'/bills',
    accounts:lander_pre+'/accounts',
    cashorders:lander_pre+'/cashorder',
    cash_order_id:lander_pre+'/cashorder/:cash_order_id',
}

const renter = {
    accesstoken:renter_pre+'/accesstoken',
    renters:renter_pre+'/phone',
    bills:renter_pre+'/bills',
    bill_id:renter_pre+'/bills/:bill_id',
    smscodes:renter_pre+'/smscodes',
    wxpaydata:renter_pre+'/wxpaydata',
}

module.exports = {
  renter,lander
}