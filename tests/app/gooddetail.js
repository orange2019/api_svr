const request = require('superagent')
const cryptUtils = require('../../app/utils/crypt_utils')
const config = require('../../config').key
const uuid = require('uuid')
const reqUuid = uuid.v4()

let content = {
  id:2
}
let cryptStr = cryptUtils.hmacMd5(content, reqUuid)
let sign = cryptUtils.sign(cryptStr, config.private)

let postData = {
  uuid: reqUuid,
  content: content,
  sign: sign
}

request.post('http://127.0.0.1:4001/mall/goods/getDetailById?token=7ee04ce9-3896-427d-90d0-c9e9d420ad1e').send(postData).type('json').then(ret => {
  console.log(ret.body)
})