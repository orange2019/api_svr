const express = require('express')
const router = express.Router()
const Log = require('./../../../lib/log')('shop-control')
const userService = require('./../../service/user_service')
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

router.use('/goods', require('./goods'))
router.use('/category',require('./category'))

// 鉴权
router.use(async (req, res, next) => {

  let checkToken = await userService.getByToken(req.ctx)
  Log.info(req.ctx.uuid, 'checkToken', checkToken)
  if (checkToken.code !== 0) {
    return res.json(checkToken)
  }

  next()
})




module.exports = router