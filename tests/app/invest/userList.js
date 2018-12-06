const request = require('superagent')
const cryptUtils = require('../../../app/utils/crypt_utils')
const config = require('../../../config').key
const uuid = require('uuid')
process.env.NODE_ENV = 'dev'
const reqUuid = uuid.v4()

let content = {
  body: {},
  query: {
    token: '739e180b-b166-43e6-84b7-3b4bb380f43c'
  }
}
let cryptStr = cryptUtils.hmacMd5(JSON.stringify(content), reqUuid)
let sign = cryptUtils.sign(cryptStr, config.private)

let postData = {
  uuid: reqUuid,
  content: content,
  sign: sign
}

request.post('http://127.0.0.1:4001/h5/investUserList').send(postData).type('json').then(ret => {
  console.log(ret.body)
}).catch(err => {
  console.error(err.message)
})