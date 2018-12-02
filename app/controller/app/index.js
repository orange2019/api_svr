const express = require('express')
const router = express.Router()
const userService = require('./../../service/user_service')
const Log = require('./../../../lib/log')('app-control')

// 解析请求数据
router.use(async (req, res, next) => {

  let uuid = req.body.uuid
  let content = req.body.content
  req.ctx = {
    uuid: uuid,
    body: content || {},
    query: req.query || {}
  }

  next()
})


router.use('/common', require('./common'))
router.use('/auth', require('./auth'))

// 鉴权
router.use(async (req, res, next) => {

  let checkToken = await userService.getByToken(req.ctx)
  Log.info(req.ctx.uuid, 'checkToken', checkToken)
  if (checkToken.code !== 0) {
    return res.json(checkToken)
  }

  next()
})

// 需要鉴权的
router.use('/account', require('./account'))


module.exports = router