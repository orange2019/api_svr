const web3Proxy = require('./proxy')
const ContractTokenModel = require('./../model/contract_token_model')
// process.env.NODE_ENV = 'dev';
(async () => {

  let accounts = await web3Proxy.getAccounts()
  let defaultAccount = accounts[0]
  console.log('default account', defaultAccount)

  let saveData = {}

  // let primaryKey = '63e4c86ece1bfb476c93b963c8aeb1dc93a692b87a2822a25f1dec343c29f416'
  // let account = await web3Proxy.accountFromPK(primaryKey)
  let account = await web3Proxy.accountCreate()
  saveData.address = account.address
  saveData.private_key = account.privateKey

  console.log(account)

  // let balance = await web3Proxy.balanceOf(account.address)

  // let contract = await web3Proxy.contract('0xB2E032B2D7D3AAAD436c72525b7E007fd54dF460')
  // let tokenBalance = await web3Proxy.getTokenBalance(contract , account.address)
  // console.log(tokenBalance)
  let accountAddress = account.address
  let balance = await web3Proxy.balanceOf(accountAddress)
  console.log(balance)
  if (balance == 0) {
    console.log('无资产')
    await web3Proxy.sendTransaction(defaultAccount, accountAddress, 5)
    balance = await web3Proxy.balanceOf(accountAddress)
    console.log(balance)
  }

  let ret = await web3Proxy.deployContract(account)
  let contractAddress = ret.contractAddress
  console.log('deployContract ', contractAddress)

  saveData.contract_address = contractAddress
  console.log('saveData', saveData)
  let save = await ContractTokenModel().update(saveData)
  console.log('save ', save.id)

  let contract = await web3Proxy.contract(contractAddress)
  let tokenBalance = await web3Proxy.getTokenBalance(contract, account.address)
  console.log('tokenBalance', tokenBalance)
})()