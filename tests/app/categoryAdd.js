const request = require('superagent')
const cryptUtils = require('../../app/utils/crypt_utils')
const config = require('../../config').key
const uuid = require('uuid')

const reqUuid = uuid.v4()

let content = {
  pid: 1,
  name: '数码下的手机',
  status: 0,
  sort: 0
}
let cryptStr = cryptUtils.hmacMd5(content, reqUuid)
let sign = cryptUtils.sign(cryptStr, config.private)

let postData = {
  uuid: reqUuid,
  content: content,
  sign: sign
}

request.post('http://127.0.0.1:4001/mall/category/addCategory?token=1c503951-d97e-43c7-b5a8-49f43cf221ac').send(postData).type('json').then(ret => {
  console.log(ret.body)
})