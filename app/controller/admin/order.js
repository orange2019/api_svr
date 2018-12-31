/** 
 * @file 商城商品接口
 */
'use strict';
const express = require('express')
const router = express.Router()
const orderService = require('../../service/order_service')


/**
 * 订单列表
 */
router.post('/orderList', async(req,res)=> {
  await orderService.managerList(req.ctx)
  return res.return(req.ctx)
})

/**
 * 订单详情
 */
router.post('/orderDetail', async (req, res) => {
  await orderService.orderDetail(req.ctx)
  return res.return(req.ctx)
})

/**
 * 订单修改
 */
router.post('/orderModify', async (req, res) => {
  await orderService.orderModify(req.ctx)
  return res.return(req.ctx)
})

module.exports = router