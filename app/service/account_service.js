const Log = require('./../../lib/log')('user_service')
const UserModel = require('./../model/user_model')
const ContractTokenModel = require('./../model/contract_token_model')
const errCode = require('./../common/err_code')
const userTransationService = require('./user_transaction_service')
const tokenService = require('./token_service')
const cryptoUtils = require('./../utils/crypto_utils')
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

    let user = await UserModel()
      .model()
      .findById(userId)
    let accountAddress = user.wallet_address

    let contractToken = await ContractTokenModel().getData()
    let contractAddress = contractToken.contract_address
    let contractOwner = contractToken.address
    Log.info(`${ctx.uuid}|userAssets().contractAddress`, contractAddress)
    Log.info(`${ctx.uuid}|userAssets().accountAddress`, accountAddress)

    let userBalance = await web3.getBalance(accountAddress)
    Log.info(`${ctx.uuid}|userAssets().userBalance`, userBalance)
    let userTokenBalance = await web3.getTokenBalance(
      contractAddress,
      accountAddress,
      contractOwner
    )

    let data = {
      user_id: user.uuid
    }
    data.balance = userBalance
    data.token_balance = userTokenBalance / 10 ** 8

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

    try {
      Log.info(`${ctx.uuid}|assetsIn().body`, ctx.body)
      let userId = ctx.body.user_id // 鉴权通过了，不可能是0

      let user = await UserModel()
        .model()
        .findById(userId)
      let accountAddress = user.wallet_address

      let num = ctx.body.num

      let {
        owner,
        contract
      } = await tokenService._info()
      let transRet = await web3.tokenTransfer(
        contract,
        owner,
        accountAddress,
        num
      )
      Log.info(`${ctx.uuid}|assetsIn().transRet`, transRet)
      if (!transRet) {
        throw new Error('充值失败')
      }

      ctx.body.type = ctx.body.type || 1 // 充值
      ctx.body.hash = transRet.transactionHash
      ctx.body.gas = transRet.cumulativeGasUsed
      let userTransRet = await userTransationService.transafer(ctx)
      Log.info(`${ctx.uuid}|assetsIn().userTransRet`, userTransRet)
      if (userTransRet.code !== 0) {
        throw new Error(transRet.message)
      }
    } catch (err) {
      console.log(err)
      ret.code = errCode.FAIL.code
      ret.message = err.message || 'err'
    }

    Log.info(`${ctx.uuid}|assetsIn().ret`, ret)
    ctx.result = ret
    return ret
  }

  async assetsOut(ctx) {
    let ret = {
      code: errCode.SUCCESS.code,
      message: errCode.SUCCESS.message
    }

    try {
      Log.info(`${ctx.uuid}|userAssets().body`, ctx.body)
      let userId = ctx.body.user_id // 鉴权通过了，不可能是0
      let num = ctx.body.num
      let password = ctx.body.password

      let user = await UserModel()
        .model()
        .findById(userId)
      let accountAddress = user.wallet_address
      if (user.password != cryptoUtils.md5(password)) {
        throw new Error('密码错误')
      }
      let privateKey = user.private_key
      let account = await web3.getAccountFromPk(privateKey)

      // 用户可提取额数目
      let userAssets = await UserModel().assetsModel().findOne({
        where: {
          user_id: userId
        }
      })
      let forzenNum = 0
      if (userAssets) {
        Log.info(`${ctx.uuid}|assetsOut().userAssets`, userAssets)
        forzenNum = userAssets.token_num_frozen
        Log.info(`${ctx.uuid}|assetsOut().forzenNum`, forzenNum)
      }

      let {
        contract,
        owner
      } = await tokenService._info()

      let tokenBalance = await tokenService._getUserTokenBalance(account.address)
      Log.info(`${ctx.uuid}|assetsOut().realnum`, tokenBalance - forzenNum)
      if (tokenBalance - forzenNum < num) {
        throw new Error('代币可提取限额不足')
      }

      let gas = await web3.tokenTransferGas(
        contract,
        account,
        owner.address,
        num,
        true
      )
      Log.info(`${ctx.uuid}|assetsOut().gas`, gas)
      // 确认燃料(gas)是否够
      let userBalance = await web3.getBalance(accountAddress)
      Log.info(`${ctx.uuid}|assetsOut().userBalance`, userBalance)
      if (userBalance == 0 || userBalance < gas) {
        throw new Error('无足够交易手续费GAS')
      }

      // 调用web3转账
      let transRet = await web3.tokenTransfer(
        contract,
        account,
        owner.address,
        num
      )
      Log.info(`${ctx.uuid}|assetsOut().transRet`, transRet)
      if (!transRet) {
        throw new Error('转账失败')
      }

      // 记录转账信息
      ctx.body.type = 2 // 交易类型:提现
      ctx.body.hash = transRet.transactionHash
      ctx.body.gas = transRet.cumulativeGasUsed
      let userTransRet = await userTransationService.transafer(ctx)
      Log.info(`${ctx.uuid}|assetsOut().userTransRet`, userTransRet)
      if (userTransRet.code !== 0) {
        throw new Error(transRet.message)
      }

    } catch (err) {
      console.log(err)
      ret.code = errCode.FAIL.code
      ret.message = err.message || 'err'
    }

    Log.info(`${ctx.uuid}|assetsOut().ret`, ret)

    ctx.result = ret
    return ret
  }

  /**
   * 转账
   * @param {*} ctx
   */
  async assetsTransfer(ctx) {
    let ret = {
      code: errCode.SUCCESS.code,
      message: errCode.SUCCESS.message
    }

    try {
      Log.info(`${ctx.uuid}|assetsTransfer().body`, ctx.body)
      let userId = ctx.body.user_id // 鉴权通过了，不可能是0
      let toAddress = ctx.body.to_address
      let num = ctx.body.num
      let password = ctx.body.password

      let user = await UserModel()
        .model()
        .findById(userId)
      let accountAddress = user.wallet_address
      if (user.password != cryptoUtils.md5(password)) {
        throw new Error('密码错误')
      }

      let toUser = await UserModel()
        .model()
        .findOne({
          where: {
            wallet_address: toAddress
          }
        })
      if (!toUser || !toUser.id) {
        throw new Error('所转账至对方账户错误')
      } else {
        ctx.body.to_user_id = toUser.id
      }

      let privateKey = user.private_key
      let account = await web3.getAccountFromPk(privateKey)
      // if (user.address != account.private_key) {
      //   throw new Error('私钥错误')
      // }

      // let {
      //   address
      // } = await tokenService._info()
      // let contract = await web3.getContract(address)
      let {
        contract
      } = await tokenService._info()

      //
      // let tokenBalance = await web3.getTokenBalance(address, account.address)
      let tokenBalance = await tokenBalance._getUserTokenBalance(account.address)
      if (tokenBalance < num) {
        throw new Error('代币余额不足')
      }

      let gas = await web3.tokenTransferGas(
        contract,
        account,
        toAddress,
        num,
        true
      )
      Log.info(`${ctx.uuid}|assetsTransfer().gas`, gas)
      // 确认燃料(gas)是否够
      let userBalance = await web3.getBalance(accountAddress)
      Log.info(`${ctx.uuid}|assetsTransfer().userBalance`, userBalance)
      if (userBalance == 0 || userBalance < gas) {
        throw new Error('无足够交易手续费GAS')
      }

      // 调用web3转账
      let transRet = await web3.tokenTransfer(
        contract,
        account,
        toAddress,
        num
      )
      Log.info(`${ctx.uuid}|assetsTransfer().transRet`, transRet)
      if (!transRet) {
        throw new Error('转账失败')
      }

      // 记录转账信息
      ctx.body.type = 3 // 交易类型:转账
      ctx.body.hash = transRet.transactionHash
      ctx.body.gas = transRet.cumulativeGasUsed
      let userTransRet = await userTransationService.transafer(ctx)

      Log.info(`${ctx.uuid}|assetsTransfer().userTransRet`, userTransRet)
      if (userTransRet.code !== 0) {
        throw new Error(transRet.message)
      }
    } catch (err) {
      console.log(err)
      ret.code = errCode.FAIL.code
      ret.message = err.message || 'err'
    }

    Log.info(`${ctx.uuid}|assetsTransfer().ret`, ret)
    ctx.result = ret
    return ret
  }


}

module.exports = new AccountService()