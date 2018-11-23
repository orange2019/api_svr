const express = require('express')
const router = express.Router()

router.get('/' , async(req, res) => {
  return res.json({name : 'api_svr' , version : require('./../../package.json').version})
})


module.exports = router