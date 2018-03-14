

//形成key=value&key1=value&...的字符串
function getRawString(args) {
    let keys = Object.keys(args);
    keys = keys.sort()
    let newArgs = {};
    keys.forEach(function (key) {
        newArgs[key] = args[key];
    });

    let string = '';
    for (let k in newArgs) {
        //如果参数的值为空不参与签名
        if (newArgs[k]) {
            string += '&' + k + '=' + newArgs[k];
        }
    }
    string = string.substr(1);
    return string;
}


//根据数据格式需求生成签名
function paySign(_array,key) {
    _array = _array || {};
    //拼接成微信服务器所需字符格式
    let string = getRawString(_array);
    console.log(string)
    //key为在微信商户平台(pay.weixin.qq.com)-->账户设置-->API安全-->密钥设置
    key = key||"";
    string = string + '&key='+key;
    let crypto = require('crypto');
    let cryString = crypto.createHash('md5').update(string,'utf8').digest('hex');
    //对加密后签名转化为大写
    return cryString.toUpperCase();
}



//形成向微信服务器请求的xml格式数据
function getXmlFormat(_array) {
    let keys = Object.keys(_array);
    let _xmlData = '<xml>';
    keys.forEach(function(key) {
        _xmlData += '<' + key + '>' + _array[key] + '</' + key + '>';
    });

    //取得签名加密字符串
    // let _paySign = paySign(_array);
    // _xmlData += '<sign>' + _paySign + '</sign>';
    _xmlData += '</xml>';
    return _xmlData;
}


// 随机字符串，长度要求在32位以内。推荐随机数生成算法
function createNonceStr() {
    return Math.random().toString(36).substr(2, 15);
}

// 时间戳产生函数
function createTimeStamp() {
    return parseInt(new Date().getTime() / 1000) + '';
}


//生成订单号：日期格式加5位随机数
function createOrderNum() {
    Date.prototype.Format = function (fmt) { //author: meizz
        let o = {
            "M+": this.getMonth() + 1, //月份
            "d+": this.getDate(), //日
            "H+": this.getHours(), //小时
            "m+": this.getMinutes(), //分
            "s+": this.getSeconds(), //秒
            "q+": Math.floor((this.getMonth() + 3) / 3), //季度
            "S": this.getMilliseconds() //毫秒
        };
        if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (let k in o)
            if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
    }
    return new Date().Format("yyyyMMddHHmmssS")+Math.random().toString().substr(2,5)
}


module.exports = {
    paySign,
    getXmlFormat,
    createTimeStamp,
    createNonceStr,
    createOrderNum,

//    //取得签名加密字符串
//     let _paySign = paySign(_array);
// _xmlData += '<sign>' + _paySign + '</sign>';
}