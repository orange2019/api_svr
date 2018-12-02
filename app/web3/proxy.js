const Web3 = require('web3')
const erc20Json = require('./erc20.json')
var Tx = require('ethereumjs-tx')
// var TestRPC = require("ethereumjs-testrpc");

class Web3Proxy {

  constructor() {

    if (typeof this.web3 !== 'undefined') {
      this.web3 = new Web3(this.web3.currentProvider)
    } else {
      // set the provider you want from Web3.providers
      // console.log('get web3')
      this.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"))
      // this.web3.setProvider(TestRPC.provider())
      // web3.setProvider(ganache.provider());
    }

    // var connected = this.web3.isConnected()
    // if (!connected) {
    //   return null
    // } 

  }

  async getGasPrice() {
    return this.web3.eth.getGasPrice()
  }

  async erc20Token() {

  }

  async sendTransaction(from, to, value , privateKey) {

    // let result = this.web3.eth.sendTransaction({
    //   from: from,
    //   to: to,
    //   value: value
    // })

    // return result
    let nonce = await this.web3.eth.getTransactionCount(from, this.web3.eth.defaultBlock.pending)
    nonce++

    var txData = {
      // nonce每次++，以免覆盖之前pending中的交易
      nonce: this.web3.utils.toHex(nonce++),
      // 设置gasLimit和gasPrice
      gasLimit: this.web3.utils.toHex(99000),
      gasPrice: this.web3.utils.toHex(10e9),
      // 要转账的哪个账号  
      to: to,
      // 从哪个账号转
      from: from,
      // 0.001 以太币
      value: this.web3.utils.toHex(10e14),
      data: ''
    }

    var tx = new Tx(txData)

    // 引入私钥，并转换为16进制
    privateKey = new Buffer(privateKey, 'hex')

    // 用私钥签署交易
    tx.sign(privateKey)

    // 序列化
    var serializedTx = tx.serialize().toString('hex')

    this.web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex')).on('receipt', console.log)

    return true

  }

  async balanceOf(address) {
    let value = await this.web3.eth.getBalance(address)
    return Web3.utils.fromWei(value)
  }
  /**
   * 创建账户
   */
  async personalAccountCreate(password) {
    let account = await this.web3.eth.personal.newAccount(password)
    return account
  }

  async accountFromPK(pk) {
    let account = await this.web3.eth.accounts.privateKeyToAccount(pk)
    return account
  }

  async accountCreate() {
    let account = await this.web3.eth.accounts.create()
    // console.log('account address' , account)
    // let encrpt = await this.web3.eth.accounts.encrypt(account.privateKey,
    //   password)
    // console.log(encrpt)
    return account
  }

  async unlockAccount(address, password) {
    // console.log('unlockAccount address' , address)
    let ret = await this.web3.eth.personal.unlockAccount(address, password)
    return ret
  }

  async getAccounts() {
    let accounts = await this.web3.eth.getAccounts()
    return accounts
  }

  contract(contractAddress) {
    let abi = erc20Json.abi
    let contract = new this.web3.eth.Contract(abi, contractAddress, {
      // from : accountAddress,
      // gasPrice: '100000000'
    })
    return contract
  }

  /**
   * 获取代币的数量
   * @param {*} contract 
   * @param {*} address 
   */
  async getTokenBalance(contract, address) {
    let result = await contract.methods.balanceOf(address).call()
    return result
  }

  /**
   * 转账到指定账户
   * @param {*} contract 
   * @param {*} to 
   * @param {*} amount 
   */
  async transfer(contract, to, amount, opts) {
    let result = await contract.methods.transfer(to, amount).send(opts)
    return result
  }

  /**
   * 授权一个账户可以调用我的
   * @param {*} contract 
   * @param {*} address 
   * @param {*} value 
   * @param {*
   *  from : '需要调用的账户'
   * } opts 
   */
  async approve(contract, address, value, opts) {
    let result = await contract.methods.approve(address, value).send(opts)
    return result
  }

  /**
   * 授权方将资产转移
   * @param {*} contract 
   * @param {*} address 
   * @param {*} to 
   * @param {*} value 
   * @param {*
   *  from : '授权的账户'
   * } opts 
   */
  async transferFrom(contract, address, to, value, opts = {}) {
    let result = await contract.methods.transferFrom(address, to, value).send(opts)
    return result
  }
}

module.exports = new Web3Proxy()