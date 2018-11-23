const express = require('express')
const router = express.Router()
const CryptoJS = require('crypto-js')

router.use(async(req, res, next)=> {

  // 解密

  // let decryptData = cryptoUtils.decrypt(req.body.data , key.private)
  let decryptData = CryptoJS.AES.decrypt(req.body.data, 'kaximu2018').toString(CryptoJS.enc.Utf8)
  decryptData = decryptData ? JSON.parse(decryptData): {}

  req.ctx = {
    uuid : req.body.uuid || req.uuid,
    body : decryptData.body || {},
    session: decryptData.session || {},
    query: decryptData.query || {},
    result : {}
  }


  res.return = (ctx) => {
    
    let data = {
      uuid : ctx.uuid || req.uuid,
      content : {
        session: ctx.session || {},
        result: ctx.result || {}
      },
      timestamp : Date.now()
    }
    return res.json(data)
  }

  next()
})

router.use('/auth' , require('./auth'))

router.use(async(req, res, next)=> {

  // 检验授权

  next()
})

module.exports = router