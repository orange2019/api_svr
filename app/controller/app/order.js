/** 
 * @file 商城订单接口
 */
'use strict';
const express = require('express')
const router = express.Router()
const orderService = require('../../service/order_service')

/**
 * 积分商城（数字货币兑换积分---积分全额购物）
基本商城购物流程，根据用户提供的收获地址，提供订单列表，取消-再支付、快递流程等，不提供发票等附加业务；
购物车，提供用户预购物产品列表，并统一批量支付；
交易方式-数字货币根据固定兑换比例，兑换积分，提供全额积分购物模式，并提供现金购物模式；
交易换算模式，提供用户数字币积分兑换比例，根据设定，用户将从自身绑定的钱包账户转出相应兑换积分的数字货币至平台设定的收款账户，根据到账反馈的报文，对兑换的用户进行积分自动充值；
商城提供部分广告位，根据设计内容，提供爆款链接跳转广告位；
 */
router.post('/orderList', async (req, res) => {
    let ret = await orderService.orderList(req.ctx)
    res.json(ret)
  })

module.exports = router