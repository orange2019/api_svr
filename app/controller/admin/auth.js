const express = require('express')
const router = express.Router()
const adminService = require('./../../service/admin_service')
const authService = require('./../../service/auth_service')
const config = require('./../../../config')

router.post('/login', async (req, res) => {

  await adminService.login(req.ctx)
  return res.return(req.ctx)

})

router.post('/check', async (req, res) => {
  await adminService.check(req.ctx)
  return res.return(req.ctx)
})

router.post('/logout', async (req, res) => {
  await adminService.logout(req.ctx)
  return res.return(req.ctx)
})

router.post('/adminUpdate', async (req, res) => {
  await adminService.update(req.ctx)
  return res.return(req.ctx)
})

router.post('/verifyCode', async (req, res) => {
  req.ctx.body.mobile = config.assetsInMobile
  await authService.sendSmsCode(req.ctx)
  return res.return(req.ctx)
})



module.exports = router