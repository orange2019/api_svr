const cryptUtils = require('./../app/utils/crypt_utils')

// let key = require('./../config/index').key

// let obj = {a : 1 , b:1}

// let objStr = cryptUtils.hmacMd5(obj , '123456')
// console.log('objStr' , objStr)
// let sign = cryptUtils.sign(objStr , key.private)

// console.log('sign' , sign)
// let verify = cryptUtils.verify(objStr , sign , key.public)

// console.log('verify' , verify)

let obj = {
  mobile: '13286661539'
}

let objStr = cryptUtils.hmacMd5(obj, '7636E876FD20CA4E98683A7BEA2AC3D526E43B1B4559AD38E2A9A75B2A85DA40')
console.log('objStr', objStr)