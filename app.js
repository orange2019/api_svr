/**
 * web 入口
 */

const express = require('express') // express
// const fs = require('fs')
const path = require('path')
// const session = require('express-session') // session
const bodyParser = require('body-parser') // 处理请求中body的内容
const methodOverride = require('method-override')
const uuid = require('uuid')
const config = require('./config/index')


let log = require('./lib/log')('app')

let app = express()

// const cors = require('cors')
// var corsOptions = {
//   origin: 'http://localhost:4000',
//   // optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
// }
// app.use(cors(corsOptions))

// 单独起一个文件服务
// let app2 = express()
// app2.use('/uploads', express.static(path.join(__dirname, './uploads')))
// app2.listen(config.port.file_svr, () => {
//   log.info('file server started on port:' + config.port.file_svr)
// })

// 设置模板引擎
// let viewPath = path.join(__dirname , './app/views')
// app.set('views' , viewPath)
// app.engine('html', require('ejs').__express)
// app.set('view engine' , 'html')

// 静态文件
// session 支持
// app.use(session({
//   resave: true, // don't save session if unmodified
//   saveUninitialized: true, // don't create session until something stored
//   secret: 'open.cc512.com'
// }))

// parse request bodies (req.body)
app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(bodyParser.json())
app.use(bodyParser.raw({
  type: 'application/xml'
}))
app.use(bodyParser.text({
  type: 'text/xml'
}))

// allow overriding methods in query (?_method=put)
app.use(methodOverride('_method'))

// 记录请求id
app.use((req, res, next) => {
  req.uuid = req.uuid || uuid.v4()
  next()
})

// let responseExtendMid = require('./app/middleware/response_extend')
// app.use(responseExtendMid)

// 解析post请求数据加密
let cryptMid = require('./app/middleware/crypt_mid')
app.use(cryptMid)

// load controllers
let controller = require('./lib/boot')
controller(app, {
  verbose: !module.parent
})

app.use(function (err, req, res, next) {
  // log it
  log.info(req.originalUrl, '500', err)
  if (req.xhr) {
    // console.log(err)
    return res.status(500).json({
      code: 500,
      data: err
    })
  } else {
    // error page
    log.info(req.originalUrl, '500')
    return res.status(500).send('500 error')
  }

  // next()
})

// assume 404 since no middleware responded
app.use(function (req, res, next) {

  if (req.xhr) {
    log.info(req.originalUrl, '404')
    return res.status(404).json({
      code: 404
    })
  } else {
    // error page
    log.info(req.originalUrl, '404')
    return res.status(404).send('404 not found!')
  }

})

/* istanbul ignore next */
if (!module.parent) {
  let port = config.port.api_svr
  app.listen(port, () => {
    log.info('api server started on port:' + port)
  })

  // console.log('express web started on port 8080')

}