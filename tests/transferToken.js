const web3 = require('../app/web3')
const web3Proxy = require('../app/web3/proxy')
process.env.NODE_ENV = 'test'

;
(async () => {
  let account = await web3Proxy.accountFromPK('0x30a0ab35add1e76e4613549f04e425b971aaa0b11c36bfd669aba91ea0c8e58f')
  let contract = await web3Proxy.contract('0x556304e6D1559b77bE5cf4EEB6B7352f279f8BD9')

  let from = account.address
  let to = '0x5912eA0d194C7DA4c9c62e2aa6ABE68A65664e20'
  let num = 100000

  // let gas = await web3.tokenTransferGas(contract, account, to, num)

  // console.log(gas)
  let ret = await web3.tokenTransfer(contract, account, from, to, num)

  console.log(ret.transactionHash)
})()