const express = require('express')
const router = express.Router()

router.post('/verifyCode' , async(req, res) => {
  
  return res.json({code: 0 , message : ''})
})

module.exports = router