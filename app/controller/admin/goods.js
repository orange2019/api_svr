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
  await goodService.addGood(req.ctx)
  return res.return(req.ctx)
})

/**
 * 修改商品
 */
router.post('/modifyGood', async(req,res)=> {
   await goodService.modifyGood(req.ctx)
    return res.return(req.ctx)
})

/**
 * 商品列表
 */
router.post('/goodList', async(req,res)=> {
  await goodService.goodList(req.ctx)
  return res.return(req.ctx)
})

/**
 * 商品详情
 */
router.post('/getDetailById', async (req, res) => {
  await goodService.getDetailById(req.ctx)
  return res.return(req.ctx)
})


module.exports = router