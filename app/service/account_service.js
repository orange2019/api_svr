const Log = require('./../../lib/log')('user_service')
const UserModel = require('./../model/user_model')
const ContractTokenModel = require('./../model/contract_token_model')
const errCode = require('./../common/err_code')
// const Op = require('sequelize').Op
const web3 = require('./../web3')

class AccountService {

  /**
   * 用户资产
   * @param {*} ctx 
   */
  async userAssets(ctx) {
    let ret = {
      code: errCode.SUCCESS.code,
      message: errCode.SUCCESS.message
    }

    Log.info(`${ctx.uuid}|userAssets().body`, ctx.body)
    let userId = ctx.body.user_id // 鉴权通过了，不可能是0

    let user = await UserModel().model().findById(userId)
    let accountAddress = user.wallet_address

    let contractToken = await ContractTokenModel().getData()
    let contractAddress = contractToken.contract_address
    let contractOwner = contractToken.address
    Log.info(`${ctx.uuid}|userAssets().contractAddress`, contractAddress)
    Log.info(`${ctx.uuid}|userAssets().accountAddress`, accountAddress)

    let userBalance = await web3.getBalance(accountAddress)
    Log.info(`${ctx.uuid}|userAssets().userBalance`, userBalance)
    let userTokenBalance = await web3.getTokenBalance(contractAddress, accountAddress, contractOwner)

    let data = {
      user_id: user.uuid
    }
    data.balance = userBalance
    data.token_balance = userTokenBalance

    ret.data = data
    Log.info(`${ctx.uuid}|userAssets().ret`, ret)

    ctx.result = ret
    return ret
  }

  async assetsIn(ctx) {
    let ret = {
      code: errCode.SUCCESS.code,
      message: errCode.SUCCESS.message
    }

    Log.info(`${ctx.uuid}|userAssets().body`, ctx.body)
    let userId = ctx.body.user_id // 鉴权通过了，不可能是0

    let user = await UserModel().model().findById(userId)
    let accountAddress = user.wallet_address



    Log.info(`${ctx.uuid}|userAssets().ret`, ret)

    ctx.result = ret
    return ret
  }

  async assetsOut(ctx) {

    let ret = {
      code: errCode.SUCCESS.code,
      message: errCode.SUCCESS.message
    }

    Log.info(`${ctx.uuid}|userAssets().body`, ctx.body)
    let userId = ctx.body.user_id // 鉴权通过了，不可能是0

    let user = await UserModel().model().findById(userId)
    let accountAddress = user.wallet_address



    Log.info(`${ctx.uuid}|userAssets().ret`, ret)

    ctx.result = ret
    return ret
  }

  async assetsTransfer(ctx) {

    let ret = {
      code: errCode.SUCCESS.code,
      message: errCode.SUCCESS.message
    }

    Log.info(`${ctx.uuid}|userAssets().body`, ctx.body)
    let userId = ctx.body.user_id // 鉴权通过了，不可能是0

    let user = await UserModel().model().findById(userId)
    let accountAddress = user.wallet_address



    Log.info(`${ctx.uuid}|userAssets().ret`, ret)

    ctx.result = ret
    return ret
  }

}

module.exports = new AccountService()