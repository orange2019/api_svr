const express = require('express')
const router = express.Router()
const config = require('./../../../config')

router.post('/verifyCode', async (req, res) => {

  return res.json({
    code: 0,
    message: ''
  })
})

router.get('/verifyCode', async (req, res) => {

  return res.json({
    code: 0,
    message: ''
  })
})

router.post('/config', async (req, res) => {
  return res.json({
    code: 0,
    message: '',
    data: {
      version: '0.0.1',
      index_url: config.domain.h5 + '/invest',
      news_url: config.domain.h5 + '/news'
    }
  })
})

module.exports = router