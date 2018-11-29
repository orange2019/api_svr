const express = require('express')
const router = express.Router()
const authService = require('./../../service/auth_service')


router.post('/login', async (req, res) => {
  let ret = await authService.login(req.ctx)
  return res.json(ret)
})

router.post('/register', async (req, res) => {
  let ret = await authService.register(req.ctx)
  return res.json(ret)
})

router.post('/forgetPassword' , async(req, res) => {
  let ret = await authService.forgetPassword(req.ctx)
  return res.json(ret)
})




module.exports = router