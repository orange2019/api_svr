const web3Proxy = require('../app/web3/proxy')
const web3 = require('web3')
// console.log(web3Proxy.contract('0x5253c428dacde589b9b26489f18cbc627f7c72ae').methods)
// let contract = web3Proxy.contract('0x5253c428dacde589b9b26489f18cbc627f7c72ae' , '0xc80e071d617ce5a769d41d8fb69e63d7581f079d')

// web3Proxy.contract('0x5253c428dacde589b9b26489f18cbc627f7c72ae').methods.balanceOf('0x84c52ff2faac5a0d8fe3cf56a4cda88ea626ea73').call().then((result) => {
//   console.log(result)
// }).catch((err) => {
//   console.log(err)
// });
// let contract = web3Proxy.contract('0x5253c428dacde589b9b26489f18cbc627f7c72ae' , '0xc80e071d617ce5a769d41d8fb69e63d7581f079d')
// web3Proxy.tokenApprove(contract , '0x84c52ff2faac5a0d8fe3cf56a4cda88ea626ea73' , web3.utils.toHex(1000)).then(result => {
//   console.log(result)

//   web3Proxy.balanceOf('0xc80e071d617ce5a769d41d8fb69e63d7581f079d').then(result => {
//     console.log(result)
//   })
// }).catch(err => {
//   console.log(err)
// })



// web3Proxy.getGasPrice().then(res => {
//   console.log(res)
// })
// web3Proxy.getTokenBalance(contract , '0xc80e071d617ce5a769d41d8fb69e63d7581f079d').then(res => {
//   console.log(res)
// })

;(async () => {
  let contractAddress = '0x5253c428dacde589b9b26489f18cbc627f7c72ae'
  let defaultAccount = '0xc80e071d617ce5a769d41d8fb69e63d7581f079d'
  let account2 = '0x059F3B0862e3d2e5Ac74627938165611A251c477'

  let privateKey3 = '7588b2d2f12cd57e0e47807d1c23e71c3b7e4906fc4c2ff44f99fc7e89af87f2'
  let account3 = '0x6B36D0c11BF0e48693fc41431BC87553b7F5a780'

  let value = web3.utils.toWei('1')
  console.log(value)
  let trans = await web3Proxy.sendTransaction(account3 ,account2 , value , privateKey3)
  console.log(trans , trans)
  let balance = await web3Proxy.balanceOf(account3)
  console.log('before balance ' , balance)

  // let account = await web3Proxy.accountFromPK('7588b2d2f12cd57e0e47807d1c23e71c3b7e4906fc4c2ff44f99fc7e89af87f2')
  // console.log('account' , account)

  // let contract = web3Proxy.contract(contractAddress)

  // let account2Balance = await web3Proxy.getTokenBalance(contract , account3)
  // console.log(account2Balance)
  // let ret1 = await web3Proxy.approve(contract , defaultAccount , 100 , {from : '0xc7417A026EfC3717758efE17586Dd3Dd1545D58A'})
  // console.log('===================',ret1.transactionHash)

  // balance = await web3Proxy.balanceOf(account2)
  // console.log('middle balance ' , balance)
  // let ret2 = await web3Proxy.transferFrom(contract, account2 , account3 , 100 , {
  //   from : defaultAccount
  // })
  // console.log('===================',ret2.transactionHash)
  // balance = await web3Proxy.balanceOf(account2)
  // console.log('after balance ' , balance)
  // return

  // let password = '123456'
  // let newAccount = await web3Proxy.accountsCreate(password)
  // let privateKey = newAccount.privateKey

  // let account = await web3Proxy.accountFromPK(privateKey)
  // console.log('account' ,account)
  // let ret1 = await web3Proxy.transfer(contract , defaultAccount , 100 , {from : account.address})
  // console.log('===================',ret1.transactionHash)

  // console.log(newAccount)
  // let newAccountAddress = newAccount.address
  // console.log('new account ' , newAccount)

  web3Proxy.getAccounts().then(console.log)
  // web3Proxy.unlockAccount('0xc7417A026EfC3717758efE17586Dd3Dd1545D58A' , password).then(console.log)

  // console.log('new account ' , newAccountAddress)
  // newAccount = newAccountAddress
  // console.log('new account balance' , newAccountBalance)
  // let newAccount = '0xe177A8E3D71424ce455deCd1e88Ddc6c826d9b60'
  // let ret = await web3Proxy.transfer(contract, newAccount.address , 1000 , {from : defaultAccount})
  // console.log(ret)

  // let newAccountBalance = await web3Proxy.getTokenBalance(contract , '0x0995E21AE454F29B77e29D0148b3E843fa6D3845')
  // console.log('new account balance' , newAccountBalance)

})().catch(err => {
  console.log( 'err' + err)
})




