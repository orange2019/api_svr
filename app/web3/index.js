const web3Proxy = require('./proxy')

class Web3 {

  /**
   * 钱包账户注册
   */
  async accountRegister(){
    let account = await web3Proxy.accountCreate()
    return account || {}
  }

  /**
   * 获取账户主币
   * @param {*} address 
   */
  async getBalance(address){
    let balance = await web3Proxy.balanceOf(address)
    return balance
  }

  /**
   * 获取合约币
   * @param {*} contractAddress 
   * @param {*} accountAddress 
   */
  async getTokenBalance(contractAddress, accountAddress){
    let contract = await web3Proxy.contract(contractAddress)
    let balance = await web3Proxy.getTokenBalance(contract, accountAddress)

    return balance
  }

}

module.exports = new Web3