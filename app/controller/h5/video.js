const express = require('express')
const router = express.Router()
const VideoService = require('./../../service/video_service')

router.post('/list', async (req, res) => {
  await VideoService.h5List(req.ctx)
  return res.return(req.ctx)
})

router.post('/info', async (req, res) => {
  await VideoService.detail(req.ctx)
  return res.return(req.ctx)
})


module.exports = router