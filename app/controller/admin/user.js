const express = require('express')
const router = express.Router()
const userService = require('./../../service/user_service')

router.post('/list' , async(req, res) => {

  await userService.getUserInfoList(req.ctx)
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

router.post('/status' , async(req, res) => {

  await userService.status(req.ctx)
  return res.return(req.ctx)
  
})

router.post('/investInfoAndLogs', async(req, res) => {
  await userService.investInfoAndLogs(req.ctx)
  return res.return(req.ctx)
})




module.exports = router