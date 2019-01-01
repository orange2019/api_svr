/** 
 * @file 商城商品接口
 */
'use strict';
const express = require('express')
const router = express.Router()
const videoService = require('../../service/video_service')


/**
 * 订单列表
 */
router.post('/list', async(req,res)=> {
  await videoService.list(req.ctx)
  return res.return(req.ctx)
})

/**
 * 订单详情
 */
router.post('/detail', async (req, res) => {
  await videoService.detail(req.ctx)
  return res.return(req.ctx)
})

/**
 * 订单修改
 */
router.post('/update', async (req, res) => {
  await videoService.update(req.ctx)
  return res.return(req.ctx)
})

router.post('/add', async (req,res) => {
  await videoService.add(req.ctx)
  return res.return(req.ctx)
})

module.exports = router