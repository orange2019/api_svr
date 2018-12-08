const web3 = require('../app/web3')
const web3Proxy = require('../app/web3/proxy')

;
(async () => {
  let account = await web3Proxy.accountFromPK('0x0fd1e407aff2c6da38293d5d94c7b5c9e4be524c27d4002e96c781c7b94574c1')
  let contract = await web3Proxy.contract('0x04f21CD34a7ED5EfAe0c788dbB2FBbDB2d891716')

  let from = account.address
  let to = '0xD34f565DbA3a3afB197556E7901657E232b1B091'
  let num = 10000.54321

  // let gas = await web3.tokenTransferGas(contract, account, to, num)

  // console.log(gas)
  let ret = await web3.tokenTransfer(contract, account, from, to, num)

  console.log(ret.transactionHash)
})()