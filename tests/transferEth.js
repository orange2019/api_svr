const web3Proxy = require('./../app/web3/proxy')

;
(async () => {
  let accounts = await web3Proxy.getAccounts()
  let defaultAccount = accounts[0]
  console.log('default account', defaultAccount)

  // 转账给一个
  let accountAddress = '0x459e580BC43C99Ee59CA002d2e6084D870a9890A'
  await web3Proxy.sendTransaction(defaultAccount, accountAddress, 5)
  let balance = await web3Proxy.balanceOf(accountAddress)
  console.log(balance)
})()