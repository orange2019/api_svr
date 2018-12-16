const request = require('superagent')
const cryptUtils = require('../../app/utils/crypt_utils')
const config = require('../../config').key
const uuid = require('uuid')

// process.env.NODE_ENV = 'test'

const reqUuid = uuid.v4()

let content = {
  mobile: '18676669410',
  password: '123456',
  verify_code: '7602',
  invite_code: ''
}
let cryptStr = cryptUtils.hmacMd5(content, reqUuid)
let sign = cryptUtils.sign(cryptStr, config.private)

let postData = {
  uuid: reqUuid,
  content: content,
  sign: sign
}

request.post('http://127.0.0.1:4001/app/auth/register').send(postData).type('json').then(ret => {
  console.log(ret.body)
})