const express = require('express')
const router = express.Router()
const investService = require('./../../service/invest_service')

router.post('/list', async (req, res) => {

  await investService.list(req.ctx)
  return res.return(req.ctx)

})

router.post('/update', async (req, res) => {

  await investService.update(req.ctx)
  return res.return(req.ctx)

})

router.post('/info', async (req, res) => {

  await investService.info(req.ctx)
  return res.return(req.ctx)

})

router.post('/status', async (req, res) => {

  await investService.status(req.ctx)
  return res.return(req.ctx)

})

module.exports = router