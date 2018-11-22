const UserService = require('./../app/service/user_service')
const uuid = require('uuid')

// UserService.getById(1).then(ret => {
//   console.log(ret)
// })

// let ctx = {
//   UID: uuid.v4()
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

UserService.compute().then((result) => {
  console.log(result)
}).catch((err) => {
  console.log(err)
});