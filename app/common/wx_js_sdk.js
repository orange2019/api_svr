const uuidv4 = require('uuid/v4')
const crypto = require('crypto')

class WxJsSdk {

  constructor(opt){
    this.appid = opt.app_id || ''
    // this.key = opt.key || 
    this.app_secret = opt.app_secret || ''
  }

  jsApiList(){
    return [
      'chooseWXPay'
    ]
  }

  /**
   * jssdk初始化
   * @param {*} jsapiTicket 
   * @param {*} url 
   */
  getJssdkInit(jsapiTicket , url){
    let obj = {}
    let noncestr = this._getNonceStr()
    let timestamp = parseInt(Date.now() / 1000).toString()
    obj.appId = this.appid
    obj.timestamp = timestamp
    obj.nonceStr = noncestr
    obj.signature = this.signature(jsapiTicket , url ,  noncestr , timestamp)
    obj.jsApiList = this.jsApiList()

    // console.log(obj)
    return obj

  }

  // jsapi签名
  signature(jsapiTicket , url , noncestr , timestamp){

    let obj = {}

    obj.noncestr = noncestr
    obj.jsapi_ticket = jsapiTicket
    obj.timestamp = timestamp
    obj.url = url

    let sortStr = this._keySortStr(obj)

    let hash = crypto.createHash('sha1')
    hash.update(sortStr)
    let signStr = hash.digest('hex')

    return signStr
  }

  /**
   * 支付签名数据
   * @param {*} prepayId 
   */
  getWxPayInit(prepayId , signKey){

    let obj = {}
    obj.appId = this.appid
    obj.timeStamp = parseInt(Date.now() / 1000).toString()
    obj.nonceStr = this._getNonceStr()
    obj.package = 'prepay_id=' + prepayId
    obj.signType = 'MD5'

    let signObj = this._sign(obj, signKey)
    obj.paySign = signObj

    return obj
  }

  // 随机生成nonce_str
  _getNonceStr(){
    return uuidv4().replace(/-/g,'')
  }

  _sign(signObj ,  key = ''){

    let sortStr = this._keySortStr(signObj , key)

    let hash = crypto.createHash('md5')
    hash.update(sortStr)
    let signStr = hash.digest('hex')

    return signStr.toUpperCase()
  }

  // 对象按照key排序转化成字符串
  _keySortStr(obj, key = '') {
    let sdic = Object.keys(obj).sort()
    let strArr = []
    for (let k in sdic) {
      if (obj[sdic[k]]) {
        strArr.push(sdic[k] + '=' + obj[sdic[k]])
      }
    }
    if (key) {
      strArr.push('key=' + key)
    }
    return strArr.join('&')
  }
}

module.exports = WxJsSdk