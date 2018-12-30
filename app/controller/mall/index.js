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
    body: content.body || {},
    // session: content.session || {},
    query: content.query || {},
    result: {}
  }

  res.return = (ctx) => {

    let data = {
      uuid: ctx.uuid || req.uuid,
      content: {
        // session: ctx.session || {},
        result: ctx.result || {}
      },
      timestamp: Date.now()
    }
    return res.json(data)
  }

  next()
})

router.use('/goods', require('./goods'))
router.use('/category', require('./category'))

// 鉴权
router.use(async (req, res, next) => {

  let checkToken = await userService.getByToken(req.ctx)
  Log.info(req.ctx.uuid, 'checkToken', checkToken)
  if (checkToken.code !== 0) {
    // req.ctx.result = checkToken
    req.ctx.result = {
      code: -100,
      message: '请重新登录'
    }
    return res.return(req.ctx)
  }

  next()
})

router.post('/authInfo', async (req, res) => {

  await userService.getUserInfo(req.ctx)
  return res.return(req.ctx)

})

router.use('/user', require('./user'))

router.use('/order', require('./order'))




module.exports = router