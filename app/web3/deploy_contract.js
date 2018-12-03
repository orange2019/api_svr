const web3Proxy = require('./proxy')

;(async ()=> {
  let defaultAccount = '0xdc484ff68d756ac4e19d4990225d9c697be12aa0'

  let primaryKey = '63e4c86ece1bfb476c93b963c8aeb1dc93a692b87a2822a25f1dec343c29f416'
  let account = await web3Proxy.accountFromPK(primaryKey)
  console.log(account)

  let balance = await web3Proxy.balanceOf(account.address)

  let contract = await web3Proxy.contract('0xB2E032B2D7D3AAAD436c72525b7E007fd54dF460')
  let tokenBalance = await web3Proxy.getTokenBalance(contract , account.address)
  console.log(tokenBalance)
  // let accountAddress = account.address
  // let balance = await web3Proxy.balanceOf(accountAddress)
  // console.log(balance)
  // if(balance == 0){
  //   console.log('无资产')
  //   await web3Proxy.sendTransaction(defaultAccount,accountAddress,5)
  //   balance = await web3Proxy.balanceOf(accountAddress)
  //   console.log(balance)
  // }

  // web3Proxy.deployContract(account)
})()