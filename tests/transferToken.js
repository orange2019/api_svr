const web3 = require('../app/web3')
const web3Proxy = require('../app/web3/proxy')
// process.env.NODE_ENV = 'test'

;
(async () => {
  let account = await web3Proxy.accountFromPK('0x92be80466927b905499ba9781d8b5591a47d7b19be64ceda0d7accfa66dabf49')
  let contract = await web3Proxy.contract('0x85b649B123e7c54E798faF40536110e1804c74c8')

  let from = account.address
  let to = '0x2Eb66345968B362D1D3BBed35BC0985A0870565F'
  let num = 100000

  let gas = await web3.tokenTransferGas(contract, account, from, to, num)

  console.log(gas)
  let ret = await web3.tokenTransfer(contract, account, from, to, num)

  console.log(ret.transactionHash)
})()