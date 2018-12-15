const web3Proxy = require('./proxy')
const ContractTokenModel = require('./../model/contract_token_model')

;
(async () => {

  // 自家链上
  // let accounts = await web3Proxy.getAccounts()
  // let defaultAccount = accounts[0]
  // console.log('default account', defaultAccount)
  // let account = await web3Proxy.accountCreate()

  // 提供主账户秘钥
  let primaryKey = '0x53946c6d184c555d528a5cc27d0c54def09cdd59f26b788c97aeac5a9551d8a9'
  let account = await web3Proxy.accountFromPK(primaryKey)

  let saveData = {}

  saveData.address = account.address
  saveData.private_key = account.privateKey

  // console.log(account)

  let accountAddress = account.address
  let balance = await web3Proxy.balanceOf(accountAddress)
  // console.log(balance)
  if (balance <= 0) {
    console.log('无资产')
    // await web3Proxy.sendTransaction(defaultAccount, accountAddress, 5)
    // balance = await web3Proxy.balanceOf(accountAddress)
    // console.log(balance)

  } else {
    console.log('资产:', balance)
  }

  let ret = await web3Proxy.deployContract(account)
  let contractAddress = ret.contractAddress
  console.log('deployContract ', contractAddress)

  saveData.contract_address = contractAddress
  console.log('saveData', saveData)
  let save = await ContractTokenModel().update(saveData, 1)
  console.log('save ', save.id)

  // let contractAddress = '0xD5be76e82A0796AB62603e4236A544cEb9406492'
  // let contractAddress = '0x6cd9a9ed81e549d7d0f7d8f43187778b61d1654b'
  // let accountAddress = '0x9716b821d7828b1e5b5362fdc0d2574d7dbc97df'
  let contract = await web3Proxy.contract(contractAddress)
  console.log('contract', contract)
  let tokenBalance = await web3Proxy.getTokenBalance(contract, accountAddress)
  console.log('tokenBalance', tokenBalance)
})()