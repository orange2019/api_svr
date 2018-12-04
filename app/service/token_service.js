const web3 = require('./../web3')
const web3Proxy = require('./../web3/proxy')
const ContractTokenModel = require('./../model/contract_token_model')

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


}

module.exports = new TokenService