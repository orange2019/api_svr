const web3 = require('../app/web3')
const web3Proxy = require('../app/web3/proxy')
// process.env.NODE_ENV = 'test'

;
(async () => {
  let account = await web3Proxy.accountFromPK('0x53946c6d184c555d528a5cc27d0c54def09cdd59f26b788c97aeac5a9551d8a9')
  const contractAddress = '0x3B7590b9723F3bb303BCD86Af71126fEaC39BAF3'
  let contract = await web3Proxy.contract(contractAddress)

  let from = account.address
  let to = '0x' + 'f4aCa16e9E640b9Ea14Cc2440b2FA56D12A1E35c'.toLowerCase()
  let num = 20

  let gas = await web3.tokenTransferToGas(contract, account, to, num)

  console.log(gas)
  let ret = await web3.tokenTransferTo(contract, account, to, num)

  console.log(ret.transactionHash)

  let count = await web3.getTokenBalance(contractAddress, to)
  console.log(count)
})()