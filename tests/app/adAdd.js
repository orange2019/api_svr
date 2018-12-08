const request = require('superagent')
const cryptUtils = require('../../app/utils/crypt_utils')
const config = require('../../config').key
const uuid=  require('uuid')

const reqUuid = uuid.v4()

let content = {
    title : '广告2',
    description :  '广告简介',
    photo  :  'http://photo.weibo.com/1258256457/wbphotos/large/mid/4314951352857754/pid/4aff7849ly1fxzafflnaij20f00kux19',
    link   :  'http://google.com',
    status :  1,
}
let cryptStr = cryptUtils.hmacMd5(content, reqUuid)
let sign = cryptUtils.sign(cryptStr, config.private)

let postData = {
  uuid: reqUuid,
  content: content,
  sign: sign
}


request.post('http://127.0.0.1:4001/app/ad/adAdd?token=cc5b4468-e2a2-44f8-b8e6-d3e274027c94').send(postData).type('json').then(ret => {
  console.log(JSON.stringify(ret.body))
})