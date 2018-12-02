const web3Proxy = require('./proxy')

class Web3 {

  /**
   * 钱包账户注册
   */
  async accountRegister(){
    let account = await web3Proxy.accountCreate()
    return account || {}
  }
}

module.exports = new Web3