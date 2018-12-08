const request = require('superagent')
const cryptUtils = require('../../app/utils/crypt_utils')
const config = require('../../config').key
const uuid = require('uuid')

const reqUuid = uuid.v4()

let content = {
  'num': 25000.5000,
  'to_address': '0x78A5B2a79ec7173b4c9Bf655f77E68a0dA1DccB4',
  'password': '123456'
}

let cryptStr = cryptUtils.hmacMd5((content), reqUuid)
let sign = cryptUtils.sign(cryptStr, config.private)

let postData = {
  uuid: reqUuid,
  content: content,
  sign: sign
}

request.post('http://127.0.0.1:4001/app/account/assetsTransfer?token=cc5b4468-e2a2-44f8-b8e6-d3e274027c94').send(postData).type('json').then(ret => {
  console.log(ret.body)
})