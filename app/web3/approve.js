const web3 = require('./index')
const web3Proxy = require('./proxy');
(async () => {

  // 提供主账户秘钥
  let primaryKey = '0x53946c6d184c555d528a5cc27d0c54def09cdd59f26b788c97aeac5a9551d8a9'
  let contractAddress = '0x3B7590b9723F3bb303BCD86Af71126fEaC39BAF3'
  let spender = '0xf4aCa16e9E640b9Ea14Cc2440b2FA56D12A1E35c'
  let num = 100

  let account = await web3Proxy.accountFromPK(primaryKey)
  // console.log(account)
  let contractObj = await web3.getContract(contractAddress)
  // console.log(contractObj)
  let ret = await web3.approveTransfer(contractObj, account, spender, num)
  console.log(ret)

  let allowance = await web3.getTokenAllowance(contractAddress, account.address, spender)
  console.log(allowance)
})()