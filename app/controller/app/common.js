const express = require('express')
const router = express.Router()

router.post('/vrcode' , async(req, res) => {
  
  return res.json({code: 0 , message : ''})
})

module.exports = router