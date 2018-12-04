const express = require('express')
const router = express.Router()
// const configService = require('./../../service/config_service')
const tokenService = require('./../../service/token_service')

router.post('/tokenInfo', async (req, res) => {

  await tokenService.getInfo(req.ctx)
  return res.return(req.ctx)

})






module.exports = router