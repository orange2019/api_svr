const express = require('express')
const router = express.Router()
const newsService = require('./../../service/news_service')

router.post('/list' , async(req, res) => {

  await newsService.list(req.ctx)
  return res.return(req.ctx)
  
})

router.post('/detail' , async(req, res) => {

  await newsService.detail(req.ctx)
  return res.return(req.ctx)
  
})

router.post('/update' , async(req, res) => {

  await newsService.update(req.ctx)
  return res.return(req.ctx)
  
})

router.post('/status' , async(req, res) => {

  await newsService.status(req.ctx)
  return res.return(req.ctx)
  
})




module.exports = router