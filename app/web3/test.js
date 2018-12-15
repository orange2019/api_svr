const web3Proxy = require('./proxy')

;
(async () => {

  let contractAddress = '0xbc53e39E315dFE354105a77c5c713B9719888A86'
  let accountAddress = '0xb96632c44B702dDbb5Cfb41D49A29130dE63268b'
  let contract = await web3Proxy.contract(contractAddress)
  console.log('contract', contract)
  let tokenBalance = await web3Proxy.getTokenBalance(contract, accountAddress)
  console.log('tokenBalance', tokenBalance)
})()