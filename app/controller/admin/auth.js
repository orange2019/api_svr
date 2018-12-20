const express = require('express')
const router = express.Router()
const adminService = require('./../../service/admin_service')

router.post('/login', async (req, res) => {

  await adminService.login(req.ctx)
  return res.return(req.ctx)

})

router.post('/check', async (req, res) => {
  await adminService.check(req.ctx)
  return res.return(req.ctx)
})

router.post('/logout', async (req, res) => {
  await adminService.logout(req.ctx)
  return res.return(req.ctx)
})

router.post('/adminUpdate', async (req, res) => {
  await adminService.update(req.ctx)
  return res.return(req.ctx)
})



module.exports = router