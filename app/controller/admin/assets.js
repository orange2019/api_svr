const express = require('express')
const router = express.Router()
// const configService = require('./../../service/config_service')
const tokenService = require('./../../service/token_service')
const accountService = require('./../../service/account_service')

router.post('/tokenInfo', async (req, res) => {

  await tokenService.getInfo(req.ctx)
  return res.return(req.ctx)

})

router.post('/inByAddress', async (req, res) => {
  await accountService.assetsInByAddress(req.ctx)
  return res.return(req.ctx)
})

router.post('/frozen', async (req, res) => {
  await accountService.assetsFrozen(req.ctx)
  return res.return(req.ctx)
})

router.post('/unFrozen', async (req, res) => {
  await accountService.assetsUnfrozen(req.ctx)
  return res.return(req.ctx)
})

router.post('/in', async (req, res) => {
  await accountService.assetsIn(req.ctx)
  return res.return(req.ctx)
})

router.post('/outList', async (req, res) => {
  await accountService.assetsOutList(req.ctx)
  return res.return(req.ctx)
})

router.post('/outFail', async (req, res) => {
  await accountService.assetsOutFail(req.ctx)
  return res.return(req.ctx)
})

router.post('/outSuccess', async (req, res) => {
  await accountService.assetsOutSuccess(req.ctx)
  return res.return(req.ctx)
})








module.exports = router