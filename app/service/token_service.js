const web3 = require('./../web3')
const web3Proxy = require('./../web3/proxy')
const ContractTokenModel = require('./../model/contract_token_model')
const errCode = require('./../common/err_code')

class TokenService {

  async info() {
    let contractToken = await ContractTokenModel().getData()
    let contractAddress = contractToken.contract_address
    let ownerAddress = contractToken.address
    let ownerPrivateKey = contractToken.private_key

    let owner = await web3Proxy.accountFromPK(ownerPrivateKey)

    return {
      owner: owner,
      address: contractAddress
    }
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