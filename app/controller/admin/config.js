const express = require('express')
const router = express.Router()
const configService = require('./../../service/config_service')

router.post('/value' , async(req, res) => {

  await configService.value(req.ctx)
  return res.return(req.ctx)
  
})

router.post('/submit' , async(req, res) => {

  await configService.submit(req.ctx)
  return res.return(req.ctx)
  
})





module.exports = router