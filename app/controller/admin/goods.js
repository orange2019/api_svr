/** 
 * @file 商城商品接口
 */
'use strict';
const express = require('express')
const router = express.Router()
const goodService = require('../../service/good_service')


/**
 * 添加商品
 */
router.post('/addGood', async(req,res)=> {
  let ret = await goodService.addGood(req.ctx)
  res.json(ret)
})

/**
 * 修改商品
 */
router.post('/modifyGood', async(req,res)=> {
  let ret = await goodService.modifyGood(req.ctx)
  res.json(ret)
})

/**
 * 商品列表
 */
router.post('/goodList', async(req,res)=> {
  let ret = await goodService.goodList(req.ctx)
  res.json(ret)
})

module.exports = router