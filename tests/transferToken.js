const web3 = require('../app/web3')
const web3Proxy = require('../app/web3/proxy')
// process.env.NODE_ENV = 'test'

;
(async () => {
  let account = await web3Proxy.accountFromPK('0x53946c6d184c555d528a5cc27d0c54def09cdd59f26b788c97aeac5a9551d8a9')
  let contract = await web3Proxy.contract('0x3B7590b9723F3bb303BCD86Af71126fEaC39BAF3')

  let from = account.address
  let to = '0x772F1e8e6713f598B5b7f0c7773d2343470d382b'
  let num = 1000

  let gas = await web3.tokenTransferGas(contract, account, from, to, num)

  console.log(gas)
  let ret = await web3.tokenTransfer(contract, account, from, to, num)

  console.log(ret.transactionHash)
})()