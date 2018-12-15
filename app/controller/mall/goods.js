/** 
 * @file 商城商品接口
 */
'use strict';
const express = require('express')
const router = express.Router()
const goodService = require('../../service/good_service')


// /**
//  * 添加分类
//  */
// router.post('/addCategory', async(req,res)=> {
//   let ret = await goodService.addCategory(req.ctx)
//   res.json(ret)
// })

module.exports = router