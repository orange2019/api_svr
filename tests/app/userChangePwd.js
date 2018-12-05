const request = require('superagent')
const cryptUtils = require('../../app/utils/crypt_utils')
const config = require('../../config').key
const uuid=  require('uuid')

const reqUuid = uuid.v4()

let content = {
  password: '123456',
  password_again: '123456'
}
let cryptStr = cryptUtils.hmacMd5(JSON.stringify(content), reqUuid)
let sign = cryptUtils.sign(cryptStr, config.private)

let postData = {
  uuid: reqUuid,
  content: content,
  sign: sign
}


request.post('http://127.0.0.1:4001/app/account/changePwd?token=96c95fd1-1658-4e35-9703-056aaabe5236').send(postData).type('json').then(ret => {
  console.log(ret.body)
})