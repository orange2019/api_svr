const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const dateUtils = require('./../utils/date_utils')
const uuidUtils = require('./../utils/uuid_utils')
const config = require('./../../config')
const OSS = require('ali-oss');
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

  upload(req, res, (err) => {
    if(err){
      Log.error(err)
      return res.json({code:1, message: '上传失败'})
    }

    Log.info(req.files)
    let filePath = path.join('/uploads/images/' , dateUtils.dateFormat(null, 'YYYYMMDD/') , req.files[0].filename)
    let url = config.domain.img2 + filePath
    Log.info(url)
    return res.json({
      code: 0 ,
      message: '上传成功',
      data : {
        url : url
      }
    })
    // 
  })

  // res.send('success')

})


module.exports = router