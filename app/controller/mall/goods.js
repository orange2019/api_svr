/** 
 * @file 商城商品接口
 */
'use strict';
const express = require('express')
const router = express.Router()
const goodService = require('../../service/good_service')


/**
 * 添加分类
 */
router.post('/getDetailById', async (req, res) => {
  let ret = await goodService.getDetailById(req.ctx)
  return res.return(req.ctx)
})

/**
 * 添加分类
 */
// router.post('/addGood', async(req,res)=> {
//   let ret = await goodService.addGood(req.ctx)
//   return res.return(req.ctx)
// })

/**
 * 商品列表
 */
router.post('/list', async (req, res) => {
  let ret = await goodService.goodList(req.ctx)
  return res.return(req.ctx)
})

module.exports = router