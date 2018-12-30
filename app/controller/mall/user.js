const express = require('express')
const router = express.Router()
const userService = require('./../../service/user_service')

router.post('/address', async (req, res) => {
  await userService.getUserAddress(req.ctx)
  return res.return(req.ctx)
})

router.post('/address/update', async (req, res) => {
  await userService.updateUserAddress(req.ctx)
  return res.return(req.ctx)
})


module.exports = router