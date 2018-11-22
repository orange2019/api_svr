const express = require('express')
const router = express.Router()
const Log = require('./../../lib/log')('index')
const UserService = require('./../service/user_service')
const BannerService = require('./../service/banner_service')
const ERR_CODE = require('./../common/err_code')
/**
 * 首页
 */
router.get('/' , async(req, res) => {
  return res.json({name : 'find_focus' , version : '0.0.1'})
})

router.post('/auth' , async(req , res) => {
  let user = req.body

  let ret = await UserService.authLog(user)

  return res.json(ret)
})

router.post('/sendSms' , async(req, res) => {

  let phone = req.body.phone

  if(phone.length != 11){
    return res.json({err: 1 , msg: '请输入正确电话号码'})
  }
  let ret = await UserService.sendSmsCode(phone)

  return res.json(ret)
})

router.get('/banners' , async(req,res) => {
  let type = req.query.type || '新闻广告'
  let category = req.query.category || ''
  let size = req.query.pagenum || 10
  let max = req.query.index_max || 0
  let ret = await BannerService.getList({
    type:type,
    category:category,
    size:size,
    index_max:max
  })
  if (!ret.rows.length) {
    return res.json(ERR_CODE.NO_DATA)
  }

  return res.success({
    list: ret.rows,
    total: ret.count,
    page_count: ret.rows.length,
    index_min: ret.rows[ret.rows.length - 1].ban_id
  })

})

module.exports = router