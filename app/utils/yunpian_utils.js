const Request = require('superagent')
// const https = require('https')
// const qs = require('querystring')
const API_KEY = '65f57ddca496686cc3b1e8187f5b849c'

const SMS_HOST = 'sms.yunpian.com'
const SMS_URI = '/v2/sms/single_send.json'
// const TPL_SMS_URI = '/v2/sms/tpl_single_send.json'

const SIGN = '【发现焦点APP】'
const Log = require('./../../lib/log')('SMS')

class YunPianUtils {

  async sendVerifyCode(mobile , code){
    let text = SIGN + '您的验证码是' + code
    let ret = await this.sendSmsV2(mobile, text)
    return ret
  }

  // async sendSms(mobile, text){
  //   var post_data = {
  //     'apikey': API_KEY,
  //     'mobile': mobile,
  //     'text': text,
  //   } //这是需要提交的数据  
  //   var content = qs.stringify(post_data)
  //   let ret = await this._post(SMS_URI, content, SMS_HOST)
  //   return ret
  // }

  async sendSmsV2(mobile , text){
    var post_data = {
      'apikey': API_KEY,
      'mobile': mobile,
      'text': text,
    } //这是需要提交的数据

    let ret = await this.request(SMS_URI, post_data)
    Log.info('sendSmsV2 ret', ret)
    return ret
  }

  request(uri , data ){
    let url = 'https://' + SMS_HOST + uri
    return new Promise((r , j) => {
      Request.post(url)
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .send(data).end((err , res) => {
          if(err) {
            Log.info('request err', err)
            // j(err)
          }
          
          Log.info('request res.status', res.status)
          Log.info('request res.body', typeof res.body, res.body)
          r(res.body || '')
        })
    })
  }

  // _post(uri, content, host) {
  //   var options = {
  //     hostname: host,
  //     port: 443,
  //     path: uri,
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
  //     }
  //   };

  //   return new Promise((r , j) => {
  //     var req = https.request(options, function (res) {
  //       // console.log('STATUS: ' + res.statusCode);  
  //       let statusCode = res.statusCode
  
  //       // console.log('HEADERS: ' + JSON.stringify(res.headers));  
  //       res.setEncoding('utf8');
  //       res.on('data', function (chunk) {
  //         // console.log('BODY: ' + chunk);
  //       });

  //       if(statusCode == 200){
  //         r(res.statusCode)
  //       }
  //     });

  //     req.on('error', (e) => {
  //       console.error(e.message);
  //       j(e.message)
  //     });

  //     //console.log(content);
  //     req.write(content);

  //     req.end();
  //   })
    
  // }

}

module.exports = new YunPianUtils