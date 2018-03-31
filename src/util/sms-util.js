
/**
 * 云通信基础能力业务短信发送、查询详情以及消费消息示例，供参考。
 * Created on 2017-07-31
 */

const  alisms = require('../../config').alisms

const SMSClient = require('@alicloud/sms-sdk')
// ACCESS_KEY_ID/ACCESS_KEY_SECRET 根据实际申请的账号信息进行替换

//初始化sms_client
const smsClient = new SMSClient({accessKeyId:alisms.access_key_id, secretAccessKey:alisms.secret_access_key})
//发送短信
async function sendSMS(phone,code,success,error){
    await smsClient.sendSMS({
        PhoneNumbers: phone,
        SignName: '租房账本',
        TemplateCode: 'SMS_120411808',
        TemplateParam: '{"code":'+code+'}'
    }).then(success, error)
}

module.exports = {
    sendSMS

}