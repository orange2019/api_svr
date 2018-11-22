/**
 * response扩展中间件
 */

const moment = require('moment')
const VERSION = require('./../../config/index').version

module.exports = (req, res, next) => {

  let ua = req.headers['user-agent'] || ''
  if (ua) {
    res.locals.is_weixin = ua.toLowerCase().match(/MicroMessenger/i) == 'micromessenger'
    res.locals.is_alipay = ua.toLowerCase().match(/Alipay/i) == 'alipay'
  }

  /**
   * 获取版本号
   */
  res.locals.version = function () {
    if (process.env.NODE_ENV == 'production') {
      return VERSION
    } else {
      return Date.now()
    }
  }

  /**
   * 返回成功数据
   */
  res.success = function () {

    let args = arguments

    let jsonData = {
      err: 0,
      msg: '',
      result: {}
    }

    for (let i = 0; i < 3; i++) {

      if (args[i] && typeof args[i] == 'string') {
        jsonData.msg = args[i]
      }

      if (args[i] && typeof args[i] == 'object') {
        jsonData.result = args[i]
      }

      if (args[i] && typeof args[i] == 'number') {
        jsonData.err = args[i]
      }
    }

    return res.json(jsonData)
  }

  /**
   * 返回失败数据
   */
  res.error = function () {
    let args = arguments
    let jsonData = {
      err: 1,
      msg: '',
      result: {}
    }

    for (let i = 0; i < 3; i++) {

      if (args[i] && typeof args[i] == 'string') {
        jsonData.msg = args[i]
      }

      if (args[i] && typeof args[i] == 'object') {
        jsonData.result = args[i]
      }

      if (args[i] && typeof args[i] == 'number') {
        jsonData.err = args[i]
      }
    }

    return res.json(jsonData)
  }

  /**
   * 常用时间戳转时间处理,记得抽出来
   * 在ejs中调用如下：
   * <?= dateFormat(voice_item.create_time)  ?>
   */
  res.locals.dateFormat = (timestamp, format) => {
    format = format || 'YYYY-MM-DD HH:mm'
    let date = null
    if (!timestamp) {
      date = new Date()
    } else {
      date = new Date(timestamp * 1000)
    }
    //logger.debug(date);
    return moment(date).format(format)
  }

  next()

}