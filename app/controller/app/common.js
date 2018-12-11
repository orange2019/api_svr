const express = require('express')
const router = express.Router()
const config = require('./../../../config')
const errCode = require('./../../common/err_code')
const smsUtils = require('./../../utils/sms_utils')
router.post('/verifyCode', async (req, res) => {
  let ret = {
    code : errCode.SUCCESS.code,
    message : errCode.SUCCESS.message
  }
  let mobile = req.body.mobile
  if(!mobile){
    ret.code = errCode.SMS.mobileNotFound.code
    ret.message = errCode.SMS.mobileNotFound.message
    return res.json(ret)
  }
  let sendStatus = await smsUtils.sendSmsCode(mobile)
  if(sendStatus === false)
  {
    ret.code = errCode.SMS.sendError.code
    ret.message = errCode.SMS.sendError.message
  }
  return res.json(ret)
})


router.post('/config', async (req, res) => {
  return res.json({
    code: 0,
    message: '',
    data: {
      version: '0.0.1',
      assets_url: config.domain.h5 + '/assets',
      index_url: config.domain.h5 + '/invest',
      news_url: config.domain.h5 + '/news'
    }
  })
})

module.exports = router