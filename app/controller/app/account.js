const express = require('express')
const router = express.Router()
const userService = require('./../../service/user_service')
const accountService = require('./../../service/account_service')


router.post('/info', async (req, res) => {
  let ret = await userService.info(req.ctx)
  res.json(ret)
})

router.post('/changePwd', async (req, res) => {
  let ret = await userService.changePwd(req.ctx)
  res.json(ret)
})

router.post('/infoUpdate', async (req, res) => {
  let ret = await userService.infoUpdate(req.ctx)
  return res.json(ret)
})

// h5
router.post('/inviteList', async (req, res) => {
  let ret = await userService.inviteList(req.ctx)
  return res.json(ret)
})

router.post('/assets', async (req, res) => {
  let ret = await accountService.userAssets(req.ctx)
  return res.json(ret)
})

/**
 * 充值
 */
router.post('/assetsIn', async (req, res) => {
  let ret = await accountService.assetsIn(req.ctx)
  return res.json(ret)
})

/**
 * 提现
 */
router.post('/assetsOut', async (req, res) => {
  let ret = await accountService.assetsOut(req.ctx)
  return res.json(ret)
})

/**
 * 转账
 */
router.post('/assetsTransfer', async (req, res) => {
  let ret = await accountService.assetsTransfer(req.ctx)
  return res.json(ret)
})


module.exports = router