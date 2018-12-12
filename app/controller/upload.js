const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const dateUtils = require('./../utils/date_utils')
const uuidUtils = require('./../utils/uuid_utils')
// const config = require('./../../config')
const aliOssUtils = require('./../utils/ali_oss_utils');
const Log = require('./../../lib/log')('upload')

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let dest = path.join(__dirname, './../../uploads/images/' , dateUtils.dateFormat(null, 'YYYYMMDD/'))
    if(!fs.existsSync(dest)){
      fs.mkdirSync(dest)
    }
    cb(null,  dest)
  },
  filename: function (req, file, cb) {
    let originalname = file.originalname.split('.')
    let ext = originalname[originalname.length - 1]
    let filename = uuidUtils.v4() + '.' + ext
    cb(null, filename)
  }
})

let upload = multer({
  // dest: path.join(__dirname, './../../uploads/images'),
  storage: storage
}).any()


router.post('/', async (req, res) => {
  let ret = {
    error: 1,
    message: '上传失败'
  }

  upload(req, res, (err) => {
    if (err) {
      Log.error(err)
      return res.json(ret)
    }
    console.log(req.files)
    Log.info(req.files);
    aliOssUtils.upload(req.files[0].path).then(uploadResult => {
      if(uploadResult.res.status != 200){
        return res.json(ret)
      }
      ret.code = 0
      ret.message = '上传成功'
      ret.data = { url : uploadResult.url }
      return res.json(ret)
    })
  })

})
module.exports = router