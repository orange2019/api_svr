const express = require('express')
const router = express.Router()
const userService = require('./../../service/user_service')
const userInvestService = require('./../../service/user_invest_service')
const userTransactionService = require('./../../service/user_transaction_service')
const tokenService = require('../../service/token_service')

router.post('/list', async (req, res) => {

  await userService.getUserInfoList(req.ctx)
  return res.return(req.ctx)

})

router.post('/listInvite', async (req, res) => {
  await userService.getUserInviteList(req.ctx)
  return res.return(req.ctx)
})

router.post('/inviteInfo', async (req, res) => {
  await userService.getUserInviteInfo(req.ctx)
  return res.return(req.ctx)
})

// router.post('/detail' , async(req, res) => {

//   await newsService.detail(req.ctx)
//   return res.return(req.ctx)

// })

// router.post('/update' , async(req, res) => {

//   await newsService.update(req.ctx)
//   return res.return(req.ctx)

// })

router.post('/status', async (req, res) => {

  await userService.status(req.ctx)
  return res.return(req.ctx)

})

router.post('/investInfoAndLogs', async (req, res) => {
  await userInvestService.investInfoAndLogs(req.ctx)
  return res.return(req.ctx)
})

router.post('/transactionList', async (req, res) => {
  await userTransactionService.list(req.ctx)
  return res.return(req.ctx)
})

router.post('/transactionApply', async (req, res) => {
  await userTransactionService.apply(req.ctx)
  return res.return(req.ctx)
})

router.post('/getTokenBalance', async (req, res) => {
  await tokenService.getUserInfo(req.ctx)
  return res.return(req.ctx)
})

/**
 * 用户地址列表
 */
router.post('/addressList', async (req, res) => {
  await userService.userAddressList(req.ctx)
  return res.return(req.ctx)
})



module.exports = router