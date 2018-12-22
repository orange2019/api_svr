const StrUtils = require('./../app/utils/str_utils')
const UserModel = require('./../app/model/user_model')
process.env.NODE_ENV = 'dev'
// let address = '0xfE6e2AD5c69f2e26fa9Dab4E54275aeb34D015E8'

// let ret = StrUtils.transWalletAddress(address)

// console.log(ret)

UserModel().model().findAll().then(users => {
  users.forEach(user => {
    user.reserve_address = StrUtils.transWalletAddress(user.wallet_address)
    user.save()
  })
})