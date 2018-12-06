const cryptUtil = require('./../utils/crypt_utils')
const publicKey = require('././../../config').key.public
const Log = require('./../../lib/log')('crypt_mid')

module.exports = async (req, res, next) => {

  let method = req.method
  if (method.toUpperCase() === 'POST') {
    let {
      uuid,
      content,
      sign
    } = req.body
    Log.info(`${uuid}|${req.originalUrl}|req.body`, req.body)
    if (!uuid || !content || !sign) {
      return res.status(400).json({
        code: -1,
        message: 'post body params err'
      })
    }

    let cryptStr = cryptUtil.hmacMd5(JSON.stringify(content), uuid)
    Log.info(`${uuid}|${req.originalUrl}|req.cryptStr`, cryptStr)
    // 验证签名
    let verify = cryptUtil.verify(cryptStr, sign, publicKey)
    Log.info(`${uuid}|${req.originalUrl}|verify:`, verify)

    if (!verify) {
      return res.status(400).json({
        code: -1,
        message: 'post body params verify err'
      })
    } else {
      next()
    }
  } else {
    next()
  }
}