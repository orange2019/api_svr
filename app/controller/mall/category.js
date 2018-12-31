/** 
 * @file 商城商品分类接口
 */
'use strict'
const express = require('express')
const router = express.Router()
const goodService = require('../../service/good_service')

/**
 * 分类列表
 */
router.post('/', async (req, res) => {
  await goodService.categoryList(req.ctx)
  return res.return(req.ctx)
})
/**
 * 添加分类
 */
router.post('/addCategory', async (req, res) => {
  await goodService.addCategory(req.ctx)
  return res.return(req.ctx)
})

/**
 * 修改分类
 */
router.post('/modifyCategory', async (req, res) => {
  await goodService.modifyCategory(req.ctx)
  return res.return(req.ctx)
})




module.exports = router