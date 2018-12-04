const web3Proxy = require('./../app/web3/proxy')

;
(async () => {
  let accounts = await web3Proxy.getAccounts()
  let defaultAccount = accounts[0]
  console.log('default account', defaultAccount)

  // 转账给一个
  let accountAddress = '0x5D4c47578abad687862c45fBccad03936c030e58'
  await web3Proxy.sendTransaction(defaultAccount, accountAddress, 0.1)
  let balance = await web3Proxy.balanceOf(accountAddress)
  console.log(balance)
})()