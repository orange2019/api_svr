const request = require('superagent')
const cryptUtils = require('../../app/utils/crypt_utils')
const config = require('../../config').key
const uuid=  require('uuid')

const reqUuid = uuid.v4()

let content = {
  c_id : 1,
  name : '商品名称2',
  cover : "http://photo.weibo.com/1642292081/wbphotos/large/mid/4317951748461347/pid/61e36371ly1fy8v0lup0nj20h308fq3o",
  info  :  '商品信息',
  price : 1809.99,
  stock : 1, //库存
  description : '简介2',
  status : 0
}
let cryptStr = cryptUtils.hmacMd5(content, reqUuid)
let sign = cryptUtils.sign(cryptStr, config.private)

let postData = {
  uuid: reqUuid,
  content: content,
  sign: sign
}


request.post('http://127.0.0.1:4001/mall/goods/addGood?token=4d9555dd-5b9d-4d7d-a68a-e3723101bcca').send(postData).type('json').then(ret => {
  console.log(JSON.stringify(ret.body))
})