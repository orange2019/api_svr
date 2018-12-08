const request = require('superagent')
const cryptUtils = require('../../app/utils/crypt_utils')
const config = require('../../config').key
const uuid = require('uuid')

// process.env.NODE_ENV = 'test'

const reqUuid = uuid.v4()

let content = {
  mobile: '17666136141',
  password: '123456',
  verify_code: '',
  invite_code: ''
}
let cryptStr = cryptUtils.hmacMd5(content, reqUuid)
let sign = cryptUtils.sign(cryptStr, config.private)

let postData = {
  uuid: reqUuid,
  content: content,
  sign: sign
}

request.post('http://api.kxm.cc512.com/app/auth/register').send(postData).type('json').then(ret => {
  console.log(ret.body)
})