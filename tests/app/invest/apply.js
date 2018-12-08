const request = require('superagent')
const cryptUtils = require('../../../app/utils/crypt_utils')
const config = require('../../../config').key
const uuid = require('uuid')
process.env.NODE_ENV = 'dev'
const reqUuid = uuid.v4()

let content = {
  body: {
    invest_id: 1,
    password: '123456'
  },
  query: {
    token: 'bdd9efdd-edb1-4951-ba78-e016446d2d22'
  }
}
let cryptStr = cryptUtils.hmacMd5((content), reqUuid)
let sign = cryptUtils.sign(cryptStr, config.private)

let postData = {
  uuid: reqUuid,
  content: content,
  sign: sign
}

request.post('http://127.0.0.1:4001/h5/investApply').send(postData).type('json').then(ret => {
  console.log(ret.body)
}).catch(err => {
  console.error(err.message)
})