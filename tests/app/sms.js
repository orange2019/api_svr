const request = require('superagent')
const cryptUtils = require('../../app/utils/crypt_utils')
const config = require('../../config').key
const uuid = require('uuid')

const reqUuid = uuid.v4()

let content = {

}
let cryptStr = cryptUtils.hmacMd5(content, reqUuid)
let sign = cryptUtils.sign(cryptStr, config.private)

let postData = {
  uuid: reqUuid,
  content: content,
  sign: sign
}

request.post('http://127.0.0.1:4001/app/common/verifyCode').send(postData).type('json').then(ret => {
  console.log(ret.body)
})