const web3Proxy = require('./proxy')
const Web3 = require('web3')
const chainId = require('./../../config').chainId
const Log = require('./../../lib/log')('web3')
class Web3Class {

  /**
   * 钱包账户注册
   */
  async accountRegister() {
    let account = await web3Proxy.accountCreate()
    return account || {}
  }

  /**
   * 获取账户主币
   * @param {*} address 
   */
  async getBalance(address) {
    let balance = await web3Proxy.balanceOf(address)
    return balance
  }

  async getAccountFromPk(pk) {
    let account = await web3Proxy.accountFromPK(pk)
    return account
  }

  /**
   * 获取合约币
   * @param {*} contractAddress 
   * @param {*} accountAddress 
   */
  async getTokenBalance(contractAddress, accountAddress) {
    let contract = await web3Proxy.contract(contractAddress)
    let balance = await web3Proxy.getTokenBalance(contract, accountAddress)

    return balance
  }

  /**
   * 获取合约对象
   * @param {*} address 
   */
  async getContract(address) {
    let contract = await web3Proxy.contract(address)
    return contract
  }

  /**
   * 转账
   * @param {*} account 
   * @param {*} to 
   * @param {*} num 
   */
  async tokenTransfer(contractObj, account, from, to, num) {

    try {
      let decimal = await contractObj.methods.decimals().call()
      Log.info('contract decimal:', decimal)
      let value = parseInt(num * 10 ** decimal)
      Log.info('contract value:', value)
      // let from = account.address
      let transafer = contractObj.methods.transferAllow(from, to, value)

      let contractAddress = contractObj.options.address
      let gas = await this.tokenTransferGas(contractObj, account, from, to, num)

      let tx = {
        gas: gas,
        from: account.address,
        to: contractAddress,
        data: transafer.encodeABI(),
        chainId: chainId
      }
      // Log.info(tx)

      let signed = await web3Proxy._web3().eth.accounts.signTransaction(tx, account.privateKey)
      Log.info(signed)
      let receipt = await web3Proxy._web3().eth.sendSignedTransaction(signed.rawTransaction)

      // Log.info(signed)
      return receipt
    } catch (err) {
      Log.error(err.message || err)
      return false
    }


  }

  async tokenTransferGas(contractObj, account, from, to, num, eth = false) {

    let decimal = await contractObj.methods.decimals().call()
    Log.info('contract decimal:', decimal)
    let value = parseInt(num * 10 ** decimal)
    Log.info('contract value:', value)
    // let from = account.address
    let transfer = contractObj.methods.transferAllow(from, to, value)
    let contractAddress = contractObj.options.address
    let gas = await transfer.estimateGas({
      from: account.address,
      to: contractAddress
      // gas: 5000000
    })
    Log.info('gas', gas)
    if (eth) {
      let gasPrice = await web3Proxy.getGasPrice()
      return Web3.utils.fromWei((gas * gasPrice).toString())
    } else {
      return gas
    }

  }

}

module.exports = new Web3Class