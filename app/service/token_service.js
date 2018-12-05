const web3 = require('./../web3')
const web3Proxy = require('./../web3/proxy')
const ContractTokenModel = require('./../model/contract_token_model')
const errCode = require('./../common/err_code')

class TokenService {

  /**
   * 获取合约信息
   */
  async _info() {
    let contractToken = await ContractTokenModel().getData()
    let contractAddress = contractToken.contract_address
    // let ownerAddress = contractToken.address
    let ownerPrivateKey = contractToken.private_key

    let owner = await web3Proxy.accountFromPK(ownerPrivateKey)
    let contract = await web3.getContract(contractAddress)

    return {
      owner: owner,
      address: contractAddress,
      contract: contract
    }
  }

  /**
   * 获取合约对象
   */
  async _getContract() {
    let {
      address
    } = await this._info()
    let contract = await web3.getContract(address)
    return contract

  }

  async _getOwner() {
    let {
      owner
    } = await this._info()
    return owner
  }

  /**
   * 获取用户代币数量
   * @param {*} accountAddress 
   */
  async _getUserTokenBalance(accountAddress) {
    let {
      address
    } = await this._info()
    let tolenBalance = await web3.getTokenBalance(address, accountAddress)
    return tolenBalance / 100000000
  }

  async getInfo(ctx) {
    let ret = {
      code: errCode.SUCCESS.code,
      message: errCode.SUCCESS.message
    }
    // Log.info(`${ctx.uuid}|getInfo().query`, ctx.query)

    let contractToken = await ContractTokenModel().getData()
    let contractAddress = contractToken.contract_address
    let ownerAddress = contractToken.address

    let contract = await web3Proxy.contract(contractAddress)
    let balance = await web3Proxy.balanceOf(ownerAddress)
    let tokenBalance = await web3Proxy.getTokenBalance(contract, ownerAddress)

    ret.data = {
      balance,
      tokenBalance
    }

    ctx.result = ret
    return ctx
  }


}

module.exports = new TokenService