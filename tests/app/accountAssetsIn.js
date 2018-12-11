const request = require('superagent')
const cryptUtils = require('../../app/utils/crypt_utils')
const config = require('../../config').key
const uuid = require('uuid')

const reqUuid = uuid.v4()

let content = {
  'num': 100000,
  // 'to_address': '0xD34f565DbA3a3afB197556E7901657E232b1B091',
  'password': '123456'
}

let cryptStr = cryptUtils.hmacMd5((content), reqUuid)
let sign = cryptUtils.sign(cryptStr, config.private)

let postData = {
  uuid: reqUuid,
  content: content,
  sign: sign
}

request.post('http://127.0.0.1:4001/app/account/assetsIn?token=cc5b4468-e2a2-44f8-b8e6-d3e274027c94').send(postData).type('json').then(ret => {
  console.log(ret.body)
})