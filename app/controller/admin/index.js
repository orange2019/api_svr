const express = require('express')
const router = express.Router()

router.use(async(req, res, next)=> {

  // 解密

  next()
})

router.use('/auth' , require('./auth'))

router.use(async(req, res, next)=> {

  // 检验授权

  next()
})

module.exports = router