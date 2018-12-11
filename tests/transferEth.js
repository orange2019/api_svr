const web3Proxy = require('./../app/web3/proxy')
process.env.NODE_ENV = 'test'

;
(async () => {
  let accounts = await web3Proxy.getAccounts()
  let defaultAccount = accounts[0]
  console.log('default account', defaultAccount)

  // 转账给一个
  let accountAddress = '0xe508aEDF83A62C353f5F34Ce2C4e73964Db6a35d'
  await web3Proxy.sendTransaction(defaultAccount, accountAddress, 5)
  let balance = await web3Proxy.balanceOf(accountAddress)
  console.log(balance)
})()