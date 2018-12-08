/**
 * @file 广告接口
 */
'use strict';
const express = require('express')
const router = express.Router()
const adService = require('../../service/ad_service')

/**
 * 积分商城
商城提供部分广告位，根据设计内容，提供爆款链接跳转广告位；
 */
router.post('/adList', async (req, res) => {
    let ret = await adService.adList(req.ctx)
    res.json(ret)
})

router.post('/adAdd', async (req, res) => {
  let ret = await adService.adAdd(req.ctx)
  res.json(ret)
})

router.post('/publishList', async (req, res) => {
  let ret = await adService.publishList(req.ctx)
  res.json(ret)
})

router.post('/modifyAdd', async (req, res) => {
  let ret = await adService.modifyAdd(req.ctx)
  res.json(ret)
})

module.exports = router