const express = require('express')
const router = express.Router()
const goodService = require('./../../service/good_service')
const Log = require('./../../../lib/log')('shop-control')

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




// 鉴权
router.use(async (req, res, next) => {

  let checkToken = await userService.getByToken(req.ctx)
  Log.info(req.ctx.uuid, 'checkToken', checkToken)
  if (checkToken.code !== 0) {
    return res.json(checkToken)
  }

  next()
})

router.use('/goods', require('./goods'))
router.use('/order',require('./order'))


module.exports = router