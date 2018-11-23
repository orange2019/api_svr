const crypto = require('crypto')

class CryptoUtils {

  md5(str) {

    let hash = crypto.createHash('md5')
    hash.update(str)
    let signStr = hash.digest('hex')

    return signStr.toUpperCase()
  }

  md5ByKey(obj, key) {

    let sortStr = this._keySortStr(obj, key)
    // console.log('obj=========' , obj)
    // console.log('key============' , key)
    // console.log('========================' , sortStr)
    let hash = crypto.createHash('md5')
    hash.update(sortStr)
    let signStr = hash.digest('hex')

    return signStr.toUpperCase()
  }

  checkMd5(obj, key) {

    let sign = obj.sign
    let signObj = obj
    delete signObj.sign

    let signStr = this.md5ByKey(signObj, key)
    // console.log('================',sign)
    // console.log('================',signStr)
    return (signStr == sign) ? true : false
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

  /**
   * 公钥加密
   * @param {*} data 
   * @param {*} publicKey 
   */
  encrypt(data, publicKey) {
    // console.log(publicKey)
    var buffer = Buffer.from(data)
    var encrypted = crypto.publicEncrypt(publicKey, buffer)
    return encrypted.toString('base64')
  }

  /**
   * 私钥解密
   * @param {*} encryptedStr 
   * @param {*} privateKey 
   */
  decrypt(encryptedStr, privateKey) {
    var buffer = Buffer.from(encryptedStr, 'base64')
    var decrypted = crypto.privateDecrypt({
      key: privateKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING
    }, buffer)

    return decrypted.toString('utf8')
  }

}

module.exports = new CryptoUtils()