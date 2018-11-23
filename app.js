/**
 * web 入口
 */

const express = require('express') // express
// const logger = require('morgan') // log
// const fs = require('fs')
const path = require('path')
// const session = require('express-session') // session
const bodyParser = require('body-parser') // 处理请求中body的内容
const methodOverride = require('method-override')
const uuid = require('uuid')

let log = require('./lib/log')('app')

let app = module.exports = express()

// 设置模板引擎
// let viewPath = path.join(__dirname , './app/views')
// app.set('views' , viewPath)
// app.engine('html', require('ejs').__express)
// app.set('view engine' , 'html')

// log
// let accessLogStream = fs.createWriteStream(path.join(__dirname, './logs/app' + (new Date()).toLocaleDateString() + '.log'), {flags: 'a'})
// if (!module.parent) app.use(logger('combined', {stream: accessLogStream}))

// 静态文件
app.use('/assets', express.static(path.join(__dirname , './public/assets')))
app.use('/uploads', express.static(path.join(__dirname , './public/uploads')))

// session 支持
// app.use(session({
//   resave: true, // don't save session if unmodified
//   saveUninitialized: true, // don't create session until something stored
//   secret: 'open.cc512.com'
// }))

// parse request bodies (req.body)
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(bodyParser.raw({ type: 'application/xml' }))
app.use(bodyParser.text({ type: 'text/xml' }))

// allow overriding methods in query (?_method=put)
app.use(methodOverride('_method'))

// 记录请求id
app.use((req, res, next) => {
  req.uuid = req.uuid || uuid.v4()
  next()
})

let responseExtendMid = require('./app/middleware/response_extend')
app.use(responseExtendMid)

// load controllers
let controller = require('./lib/boot')
controller(app, { verbose: !module.parent })


app.use(function(err, req, res, next){
  // log it
  if (!module.parent) {
    console.log(err)
    log.info('500' , err)
  }
  if (req.xhr){
    // console.log(err)
    return res.status(500).json({code:500 , data : err})
  }else{
    // error page
    return res.status(500).send('500 error')
  }
  
  // next()
})

// assume 404 since no middleware responded
app.use(function(req, res, next){

  if (req.xhr){
    return res.status(404).json({code:404})
  }else{
    // error page
    return res.status(404).send('404 not found!')
  }
  
})

/* istanbul ignore next */
if (!module.parent) {
  let port = 4001
  app.listen(port)
  log.info('Express server started on port:' + port)
  // console.log('express web started on port 8080')
  
}