const request = require('request')
const cryptoUtils = require('./../app/utils/crypto_utils')
const { key } = require('./../config/index')


request.post('http://127.0.0.1:4001/admin/auth/login' , {
  form: {
    data : cryptoUtils.encrypt( JSON.stringify({
      body : {
        email : '332553882@qq.com',
        password: '123456'
      }
    }) , key.public)
  }
}, (err, statusCode , body) => {
  // console.log('err' , err)
  // console.log('statusCode' , statusCode)
  console.log('body' , body)
})