const express = require('express')
const router = express.Router()
const newsService = require('./../../service/news_service')

router.use(async(req, res, next)=> {

  let uuid = req.body.uuid
  let content = req.body.content
  req.ctx = {
    uuid : uuid,
    body : content.body || {},
    session: content.session || {},
    query: content.query || {},
    result : {}
  }


  res.return = (ctx) => {
    
    let data = {
      uuid : ctx.uuid || req.uuid,
      content : {
        session: ctx.session || {},
        result: ctx.result || {}
      },
      timestamp : Date.now()
    }
    return res.json(data)
  }

  next()
})

router.post('/' , async(req, res) => {

})

router.post('/newsList' , async(req, res) => {
  await newsService.h5List(req.ctx)
  return res.return(req.ctx)
})

router.post('/newsDetail' , async(req, res) => {
  await newsService.detail(req.ctx)
  return res.return(req.ctx)
})

module.exports = router