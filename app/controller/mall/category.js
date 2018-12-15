/** 
 * @file 商城商品分类接口
 */
'use strict';
const express = require('express')
const router = express.Router()
const goodService = require('../../service/good_service')


/**
 * 添加分类
 */
router.post('/addCategory', async(req,res)=> {
  let ret = await goodService.addCategory(req.ctx)
  res.json(ret)
})

/**
 * 修改分类
 */
router.post('/modifyCategory', async (req, res) => {
  let ret = await goodService.modifyCategory(req.ctx)
  res.json(ret)
})

/**
 * 分类列表
 */
router.post('/categoryList', async(req, res) => {
  let ret = await goodService.categoryList(req.ctx)
  res.json(ret)
})


module.exports = router