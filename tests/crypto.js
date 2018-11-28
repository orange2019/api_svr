const cryptUtils = require('./../app/utils/crypt_utils')

let key = require('./../config/index').key

let obj = {a : 1 , b:1}

let objStr = cryptUtils.hmacMd5(obj , '123456')
console.log('objStr' , objStr)
let sign = cryptUtils.sign(objStr , key.private)

console.log('sign' , sign)
let verify = cryptUtils.verify(objStr , sign , key.public)

console.log('verify' , verify)