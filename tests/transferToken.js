const web3 = require('../app/web3')
const web3Proxy = require('../app/web3/proxy')
// process.env.NODE_ENV = 'test'

;
(async () => {
  let account = await web3Proxy.accountFromPK('0x53946c6d184c555d528a5cc27d0c54def09cdd59f26b788c97aeac5a9551d8a9')
  let contract = await web3Proxy.contract('0xbc53e39E315dFE354105a77c5c713B9719888A86')

  let from = account.address
  let to = '0xa8C4b953653cE7046b85bd754359d1e723cB5bdC'
  let num = 100

  let gas = await web3.tokenTransferGas(contract, account, from, to, num)

  console.log(gas)
  let ret = await web3.tokenTransfer(contract, account, from, to, num)

  console.log(ret.transactionHash)
})()