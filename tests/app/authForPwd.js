const request = require('superagent')
const cryptUtils = require('../../app/utils/crypt_utils')
const config = require('../../config').key
const uuid=  require('uuid')

const reqUuid = uuid.v4()

let content = {
  mobile: '18676669410',
  password: '12345678',
  verify_code: ''
}
let cryptStr = cryptUtils.hmacMd5(JSON.stringify(content), reqUuid)
let sign = cryptUtils.sign(cryptStr, config.private)

let postData = {
  uuid: reqUuid,
  content: content,
  sign: sign
}

request.post('http://127.0.0.1:4001/app/auth/forgetPassword').send(postData).type('json').then(ret => {
  console.log(ret.body)
})