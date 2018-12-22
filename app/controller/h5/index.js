const express = require('express')
const router = express.Router()
const newsService = require('./../../service/news_service')
const userInvestService = require('./../../service/user_invest_service')
const userService = require('./../../service/user_service')
const accountService = require('./../../service/account_service')
const authService = require('./../../service/auth_service')
const Log = require('./../../../lib/log')('h5-control')

router.use(async (req, res, next) => {

  let uuid = req.body.uuid
  let content = req.body.content
  req.ctx = {
    uuid: uuid,
    body: content.body || {},
    session: content.session || {},
    query: content.query || {},
    result: {}
  }


  res.return = (ctx) => {

    let data = {
      uuid: ctx.uuid || req.uuid,
      content: {
        session: ctx.session || {},
        result: ctx.result || {}
      },
      timestamp: Date.now()
    }
    return res.json(data)
  }

  next()
})

router.use('/video', require('./video'))

router.post('/newsList', async (req, res) => {
  await newsService.h5List(req.ctx)
  return res.return(req.ctx)
})

router.post('/newsDetail', async (req, res) => {
  await newsService.detail(req.ctx)
  return res.return(req.ctx)
})

router.post('/inviteUser', async (req, res) => {
  await userService.getByUuid(req.ctx)
  return res.return(req.ctx)
})

router.post('/register', async (req, res) => {
  await authService.register(req.ctx)
  return res.return(req.ctx)
})

router.post('/verifyCode', async (req, res) => {
  await authService.sendSmsCode(req.ctx)
  return res.return(req.ctx)
})

router.post('/resetMobile', async (req, res) => {
  await authService.resetMobile(req.ctx)
  return res.return(req.ctx)
})

// 需要鉴权
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

  let url = req.path
  console.log('===============', url)
  let whiteUrls = ['/investList', '/assets', '/invite', '/inviteList']
  if (req.ctx.body.user_status != 1 && whiteUrls.indexOf(url) < 0) {
    req.ctx.result = {
      code: -101,
      message: '用户待审核'
    }
    return res.return(req.ctx)
  }
  next()
})

router.post('/verifyCodeAuth', async (req, res) => {
  await authService.sendSmsCodeAuth(req.ctx)
  return res.return(req.ctx)
})

router.post('/verifyCodeAuthCheck', async (req, res) => {
  await authService.sendSmsCodeAuthCheck(req.ctx)
  return res.return(req.ctx)
})

router.post('/searchUserByMobile', async (req, res) => {
  await accountService.searchUserByMobile(req.ctx)
  return res.return(req.ctx)
})

router.post('/setTradePwd', async (req, res) => {
  await accountService.setTradePwd(req.ctx)
  return res.return(req.ctx)
})

router.post('/invite', async (req, res) => {
  await userService.inviteInfo(req.ctx)
  return res.return(req.ctx)
})

router.post('/investList', async (req, res) => {
  await userInvestService.list(req.ctx)
  return res.return(req.ctx)
})

router.post('/investInfo', async (req, res) => {
  await userInvestService.info(req.ctx)
  return res.return(req.ctx)
})

// h5投产
router.post('/investApply', async (req, res) => {

  await userInvestService.investApply(req.ctx)
  return res.return(req.ctx)
})

router.post('/investUserList', async (req, res) => {
  await userInvestService.getList(req.ctx)
  return res.return(req.ctx)
})

router.post('/investUserDetail', async (req, res) => {
  await userInvestService.getDetail(req.ctx)
  return res.return(req.ctx)
})

router.post('/assets', async (req, res) => {
  await accountService.userAssets(req.ctx)
  return res.return(req.ctx)
})

router.post('/assetsTransaction', async (req, res) => {
  await accountService.transactions(req.ctx)
  return res.return(req.ctx)
})

router.post('/assetsTransfer', async (req, res) => {
  await accountService.assetsTransfer(req.ctx)
  return res.return(req.ctx)
})

router.post('/investTeam', async (req, res) => {
  await accountService.investChild(req.ctx)
  return res.return(req.ctx)
})

router.post('/investTeamInfo', async (req, res) => {
  await accountService.investChildInfo(req.ctx)
  return res.return(req.ctx)
})

router.post('/inviteList', async (req, res) => {
  await userService.inviteList(req.ctx)
  return res.return(req.ctx)
})

router.post('/resetPwd', async (req, res) => {
  await userService.changePwd(req.ctx)
  return res.return(req.ctx)
})


module.exports = router