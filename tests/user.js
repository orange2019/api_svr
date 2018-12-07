const UserService = require('./../app/service/user_service')
// const UserTransactionService = require('./../app/service/user_transaction_service')
const UserInvestService = require('./../app/service/user_invest_service')

process.env.NODE_ENV = 'dev'

UserInvestService.investComputes()
// UserInvestService._computedChild(12, 10000).then(ret => {
//   console.log(ret)
// })
// const UserModel = require('./../app/model/user_model')
// UserModel().getAllChilds([12]).then(ret => {
//   console.log(ret)
// })

// const uuid = require('uuid')

// UserService.getById(1).then(ret => {
//   console.log(ret)
// })

// let ctx = {
//   uuid: uuid.v4()
// }
// let userId = 1
// let investData = {
//   num : 20000,
//   days : 30
// }

// UserService.invest(ctx, userId, investData).then(ret => {
//   console.log(ret)
// })

// UserService.getAllToRoot(ctx , 3).then(ret => {
//   console.log(JSON.stringify(ret))
// })

// UserService.compute().then((result) => {
//   console.log(result)
// }).catch((err) => {
//   console.log(err)
// });

// UserService.getUserInfoList(ctx).then(ret => {
//   console.log(ret)
// })

// UserTransactionService.list(ctx).then(ret => {
//   console.log('UserTransactionService.list.ret' , ret)
// })

// ctx.body = {
//   user_id: 1,
//   type: 1,
//   num: 1500
// }
// UserTransactionService.add(ctx).then(ret => {
//   console.log('UserTransactionService.add.ret' , ret)
// })