const express = require('express')
const router = express.Router()
const userService = require('./../../service/user_service')


router.post('/info' , async(req, res)=>{
  let ret = await userService.info(req.ctx)
  res.json(ret)
})

router.post('/assets' , async(req, res) => {
  let ret = await userService.userAssets(req.ctx)
  res.json(ret)
})

// 调用接口
router.post('/setTradePwd' , async(req, res) => {
  let ret = await userService.setTradePwd(req.ctx)
  res.json(ret)
})

// 调用接口
router.post('/changePwd' , async(req, res)=>{
  let ret = await userService.changePwd(req.ctx)
  res.json(ret)
})


router.post('/infoUpdate' , async(req, res) => {
  let ret = await userService.infoUpdate(req.ctx)
  return res.json(ret)
})

// h5
router.post('/inviteList', async(req, res)=>{
  let ret = await userService.inviteList(req.ctx)
  return res.json(ret)
})

module.exports = router