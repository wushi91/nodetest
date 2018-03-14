module.exports = {

    // getXMLNodeValue: function(node_name, xml) {
    //     var tmp = xml.split("<" + node_name + "><![CDATA[");
    //     var _tmp = tmp[1].split("]]></" + node_name + ">");
    //     return _tmp[0];
    // },

    //取得微信端返回来的xml标签里的value
    getXMLNodeValue: function (node_name, xml, flag) {
        flag = flag || false;
        let _reNodeValue = '';
        let tmp = xml.split('<' + node_name + '>');
        if (tmp) {
            let _tmp = tmp[1].split('</' + node_name + '>')[0];
            if (!flag) {
                let _tmp1 = _tmp.split('[');
                _reNodeValue = _tmp1[2].split(']')[0]
            } else {
                _reNodeValue = _tmp;
            }
        }
        return _reNodeValue;
    }
}
