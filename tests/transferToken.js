const web3 = require('../app/web3')
const web3Proxy = require('../app/web3/proxy')

;
(async () => {
  let account = await web3Proxy.accountFromPK('0x41cdc96338c238e0d8ed0e455825fdcee7d88dc4a868cc4cd91bc6bd09a7a0ec')
  let contract = await web3Proxy.contract('0x0f923D4dAB60a6EaFce8224871DBa4400271A005')

  let to = '0x5D4c47578abad687862c45fBccad03936c030e58'
  let num = 10000.54321

  // let gas = await web3.tokenTransferGas(contract, account, to, num)

  // console.log(gas)
  let ret = await web3.tokenTransfer(contract, account, to, num)

  console.log(ret.transactionHash)
})()