const request = require('superagent')
const cryptUtils = require('../../app/utils/crypt_utils')
const config = require('../../config').key
const uuid = require('uuid')

// process.env.NODE_ENV = 'dev'

const reqUuid = uuid.v4()

let content = {
  mobile: '18676669411',
  password: '123456',
  verify_code: '',
  invite_code: 'd84z1ih5'
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