/**
 * @file 商品分类
 * 
 */
'use strict';
const express = require('express')
const router = express.Router()
const goodService = require('../../service/good_service')

router.post('/categoryList', async (req, res) => {
  await goodService.categoryList(req.ctx)
  return res.return(req.ctx)
})

router.post('/categoryDetail', async (req, res) => {
  await goodService.categoryDetail(req.ctx)
  return res.return(req.ctx)
})

router.post('/categoryModify', async (req, res) => {
  await goodService.modifyCategory(req.ctx)
  return res.return(req.ctx)
})

router.post('/addCategory', async (req, res) => {
  await goodService.addCategory(req.ctx)
  return res.return(req.ctx)
})

module.exports = router