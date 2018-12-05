const request = require('superagent')
const cryptUtils = require('../../app/utils/crypt_utils')
const config = require('../../config').key
const uuid = require('uuid')

const reqUuid = uuid.v4()

let content = {

}
let cryptStr = cryptUtils.hmacMd5(JSON.stringify(content), reqUuid)
let sign = cryptUtils.sign(cryptStr, config.private)

let postData = {
  uuid: reqUuid,
  content: content,
  sign: sign
}

request.post('http://127.0.0.1:4001/app/account/info?token=739e180b-b166-43e6-84b7-3b4bb380f43c').send(postData).type('json').then(ret => {
  console.log(ret.body)
})

// request.post('http://127.0.0.1:4001/app/account/assets?token=123456').send(postData).type('json').then(ret => {
//   console.log(ret.body)
// })

request.post('http://127.0.0.1:4001/app/account/inviteList?token=739e180b-b166-43e6-84b7-3b4bb380f43c').send(postData).type('json').then(ret => {
  console.log(ret.body)
})