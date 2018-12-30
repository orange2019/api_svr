const Log = require('./../../lib/log')('user_service')
const UserModel = require('./../model/user_model')
const InvestModel = require('./../model/invest_model')
const ContractTokenModel = require('./../model/contract_token_model')
const errCode = require('./../common/err_code')
const userTransationService = require('./user_transaction_service')
const tokenService = require('./token_service')
const cryptoUtils = require('./../utils/crypto_utils')
const Op = require('sequelize').Op
const web3 = require('./../web3')
const DECIMALS = require('./../../config').decimals
const ScoreRate = require('./../../config').scoreRete
const StrUtils = require('./../utils/str_utils')
const smsUtils = require('./../utils/sms_utils')
const config = require('./../../config')

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
      // user_id: user.uuid
    }
    data.balance = userBalance
    data.token_balance = userTokenBalance / 10 ** 8
    data.address = StrUtils.transWalletAddress(accountAddress)
    data.isSetTradePwd = user.password_trade ? 1 : 0

    // const decimals = 100000000
    let userAssets = await UserModel().getAssetsByUserId(userId)
    data.frozen_num = userAssets.token_num_frozen
    data.backup_num = userAssets.token_num_backup
    data.token_total = (data.token_balance * DECIMALS + userAssets.token_num_frozen * DECIMALS + userAssets.token_num_backup * DECIMALS) / DECIMALS
    // data.frozen_num = 0

    let userInvest = await UserModel().investLogsModel().sum('num_self', {
      where: {
        user_id: userId
      }
    })
    let userInvestChild = await UserModel().investLogsModel().sum('num_child', {
      where: {
        user_id: userId
      }
    })
    data.invest = userInvest / 100000000
    data.invest_child = userInvestChild / 100000000

    ret.data = data
    Log.info(`${ctx.uuid}|userAssets().ret`, ret)

    ctx.result = ret
    return ret
  }

  async userAssetsOutLogs(ctx) {
    let ret = {
      code: errCode.SUCCESS.code,
      message: errCode.SUCCESS.message
    }

    Log.info(`${ctx.uuid}|userAssets().body`, ctx.body)
    let userId = ctx.body.user_id // 鉴权通过了，不可能是0

    let queryRet = await UserModel().assetsOutModel().findAndCountAll({
      where: {
        user_id: userId
      },
      order: [
        ['create_time', 'desc']
      ]
    })

    ret.data = queryRet
    ctx.result = ret
    return ret
  }

  /**
   * 解冻
   * @param {*} ctx 
   */
  async assetsUnfrozen(ctx) {
    let ret = {
      code: errCode.SUCCESS.code,
      message: errCode.SUCCESS.message
    }
    let t = await UserModel().getTrans()

    try {
      let userId = ctx.body.user_id
      let num = ctx.body.num
      let userAssets = await UserModel().getAssetsByUserId(userId)
      if (num == 0 || userAssets.token_num_backup < num) {
        throw new Error('数量错误')
      }

      ctx.body.type = 8
      // ctx.body.num = invest.num
      let userAssetsOutRet = await this.assetsIn(ctx, t)
      if (userAssetsOutRet.code != 0) {
        throw new Error(userAssetsOutRet.message)
      }

      // 
      userAssets.token_num_backup = (userAssets.token_num_backup * DECIMALS - num * DECIMALS) / DECIMALS
      let retSave = await userAssets.save({
        transcation: t
      })
      if (!retSave) {
        throw new Error('保存用户资产数据失败')
      }

    } catch (err) {
      ret.code = errCode.FAIL.code
      ret.message = err.message || 'err'

      t.rollback()
    }

    t.commit()
    ctx.result = ret
    return ret

  }

  /**
   * 冻结
   * @param {*} ctx 
   */
  async assetsFrozen(ctx) {
    let ret = {
      code: errCode.SUCCESS.code,
      message: errCode.SUCCESS.message
    }
    let t = await UserModel().getTrans()

    try {
      let userId = ctx.body.user_id
      let num = ctx.body.num
      let userAssets = await UserModel().getAssetsByUserId(userId)
      if (num == 0) {
        throw new Error('数量错误')
      }

      ctx.body.type = 7
      // ctx.body.num = invest.num
      let userAssetsOutRet = await this.assetsOut(ctx, t)
      if (userAssetsOutRet.code != 0) {
        throw new Error(userAssetsOutRet.message)
      }

      // 
      userAssets.token_num_backup = (userAssets.token_num_backup * DECIMALS + num * DECIMALS) / DECIMALS
      let retSave = await userAssets.save({
        transcation: t
      })
      if (!retSave) {
        throw new Error('保存用户资产数据失败')
      }

    } catch (err) {
      ret.code = errCode.FAIL.code
      ret.message = err.message || 'err'

      t.rollback()
    }

    t.commit()
    ctx.result = ret
    return ret
  }

  async assetsInByAddress(ctx) {

    let ret = {
      code: errCode.SUCCESS.code,
      message: errCode.SUCCESS.message
    }

    let address = ctx.body.address
    let user = await UserModel().model().findOne({
      where: {
        wallet_address: address
      }
    })

    if (!user) {
      ret.code = errCode.FAIL.code
      ret.message = '地址错误'

      ctx.result = ret
      return ret
    } else {
      ctx.body.user_id = user.id
    }

    await this.assetsIn(ctx)

    return ret
  }

  async assetsIn(ctx) {
    let ret = {
      code: errCode.SUCCESS.code,
      message: errCode.SUCCESS.message
    }

    try {
      if (ctx.body.hasOwnProperty('code')) {
        // let verify_code = ctx.body.code
        // let mobile = config.assetsInMobile
        // let checkCodeRst = await smsUtils.validateCode(mobile, verify_code)
        // Log.info(`${ctx.uuid}|sendSmsCodeAuthCheck().checkCodeRst`, checkCodeRst)
        // if (checkCodeRst.code !== 0) {
        //   throw new Error('验证码不正确')
        // }
      }

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

      let gas = await web3.tokenTransferGas(
        contract,
        owner,
        owner.address,
        accountAddress,
        num,
        true
      )
      Log.info(`${ctx.uuid}|assetsIn().gas`, gas)
      // 确认燃料(gas)是否够
      let userBalance = await web3.getBalance(owner.address)
      Log.info(`${ctx.uuid}|assetsIn().userBalance`, userBalance)
      if (userBalance == 0 || userBalance < gas) {
        throw new Error('系统无足够交易手续费GAS，请稍后再试')
      }

      let transRet = await web3.tokenTransfer(
        contract,
        owner,
        owner.address,
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

  async assetsOutSuccess(ctx) {
    let ret = {
      code: errCode.SUCCESS.code,
      message: errCode.SUCCESS.message
    }

    Log.info(`${ctx.uuid}|assetsOutList().body`, ctx.body)

    let t = await UserModel().getTrans()
    try {
      let assetsOutId = ctx.body.assets_out_id
      let userAssetsOut = await UserModel().assetsOutModel().findById(assetsOutId)
      if (!userAssetsOut) {
        throw new Error('无效条目')
      }
      let userId = userAssetsOut.user_id
      // let user = await UserModel().model().findById(userId)

      let toAddress = userAssetsOut.to_address
      let num = userAssetsOut.num

      let {
        contract,
        owner
      } = await tokenService._info()

      let gas = await web3.tokenTransferToGas(
        contract,
        owner,
        toAddress,
        num,
        true
      )
      Log.info(`${ctx.uuid}|assetsOut().gas`, gas)
      // 确认燃料(gas)是否够
      let userBalance = await web3.getBalance(owner.address)
      Log.info(`${ctx.uuid}|assetsOut().userBalance`, userBalance)
      if (userBalance == 0 || userBalance < gas) {
        throw new Error('系统无足够交易手续费GAS，请稍后再试')
      }

      // 调用web3转账
      let transRet = await web3.tokenTransferTo(
        contract,
        owner,
        toAddress,
        num
      )
      Log.info(`${ctx.uuid}|assetsOut().transRet`, transRet)
      if (!transRet) {
        throw new Error('审核通过失败')
      }

      userAssetsOut.status = 1
      let saveRet = await userAssetsOut.save({
        transcation: t
      })
      if (!saveRet) {
        throw new Error('审核通过记录失败')
      }

      // 记录转账信息
      ctx.body.user_id = userId
      ctx.body.type = 2 // 交易类型:转账
      ctx.body.hash = transRet.transactionHash
      ctx.body.gas = transRet.cumulativeGasUsed
      let userTransRet = await userTransationService.transafer(ctx, t)

      Log.info(`${ctx.uuid}|assetsTransfer().userTransRet`, userTransRet)
      if (userTransRet.code !== 0) {
        throw new Error(transRet.message)
      }

      t.commit()

    } catch (err) {

      t.rollback()
      ret.code = errCode.FAIL.code
      ret.code = err.message || 'err'
    }

    ctx.result = ret
    return ret
  }

  async assetsOutFail(ctx) {
    let ret = {
      code: errCode.SUCCESS.code,
      message: errCode.SUCCESS.message
    }

    Log.info(`${ctx.uuid}|assetsOutFail().body`, ctx.body)

    let t = await UserModel().getTrans()
    try {
      let assetsOutId = ctx.body.assets_out_id
      let userAssetsOut = await UserModel().assetsOutModel().findById(assetsOutId)
      if (!userAssetsOut) {
        throw new Error('无效条目')
      }
      let userId = userAssetsOut.user_id
      let user = await UserModel().model().findById(userId)

      let userAddress = user.wallet_address
      let num = userAssetsOut.num

      let {
        contract,
        owner
      } = await tokenService._info()

      let gas = await web3.tokenTransferGas(
        contract,
        owner,
        owner.address,
        userAddress,
        num,
        true
      )
      Log.info(`${ctx.uuid}|assetsOutFail().gas`, gas)
      // 确认燃料(gas)是否够
      let userBalance = await web3.getBalance(owner.address)
      Log.info(`${ctx.uuid}|assetsOutFail().userBalance`, userBalance)
      if (userBalance == 0 || userBalance < gas) {
        throw new Error('系统无足够交易手续费GAS，请稍后再试')
      }

      // 调用web3转账
      let transRet = await web3.tokenTransfer(
        contract,
        owner,
        owner.address,
        userAddress,
        num
      )
      Log.info(`${ctx.uuid}|assetsOutFail().transRet`, transRet)
      if (!transRet) {
        throw new Error('审核不通过失败')
      }

      userAssetsOut.remark = ctx.body.remark || ''
      userAssetsOut.status = 2
      let saveRet = await userAssetsOut.save({
        transcation: t
      })
      if (!saveRet) {
        throw new Error('审核不通过记录失败')
      }

      t.commit()

    } catch (err) {

      t.rollback()
      ret.code = errCode.FAIL.code
      ret.message = err.message || 'err'
    }

    ctx.result = ret
    return ret
  }

  async assetsOutList(ctx) {

    let ret = {
      code: errCode.SUCCESS.code,
      message: errCode.SUCCESS.message
    }

    Log.info(`${ctx.uuid}|assetsOutList().body`, ctx.body)
    let where = ctx.body.where
    let map = {}
    if (where.user_id) {
      map.user_id = where.user_id
    }

    let userAssetsOutModel = UserModel().assetsOutModel()
    let userInfoModel = UserModel().infoModel()

    userAssetsOutModel.belongsTo(userInfoModel, {
      targetKey: 'user_id',
      foreignKey: 'user_id'
    })


    let data = await userAssetsOutModel.findAndCountAll({
      where: map,
      include: [{
        model: userInfoModel,
        attributes: ['realname', 'avatar']
      }],
      offset: ctx.body.offset || 0,
      limit: ctx.body.limit || 10,
      order: [
        ['create_time', 'desc']
      ]
    })

    ret.data = data
    Log.info(`${ctx.uuid}|assetsOutList().ret`, ret)
    ctx.result = ret
    return ret


  }

  async assetsOut(ctx, t = null) {
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
      // let accountAddress = user.wallet_address
      // if (!ctx.body.hasOwnProperty('isAdmin') && !ctx.body.isAdmin) {
      //   if (user.password != cryptoUtils.md5(password)) {
      //     if (user.password_trade != cryptoUtils.md5(password)) {
      //       throw new Error('密码错误')
      //     }
      //   }
      // }

      let privateKey = user.private_key
      let account = await web3.getAccountFromPk(privateKey)

      // 用户可提取额数目
      // let userAssets = await UserModel().assetsModel().findOne({
      //   where: {
      //     user_id: userId
      //   }
      // })
      let forzenNum = 0
      // if (userAssets) {
      //   Log.info(`${ctx.uuid}|assetsOut().userAssets`, userAssets)
      //   forzenNum = userAssets.token_num_frozen
      //   Log.info(`${ctx.uuid}|assetsOut().forzenNum`, forzenNum)
      // }

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
        owner,
        account.address,
        owner.address,
        num,
        true
      )
      Log.info(`${ctx.uuid}|assetsOut().gas`, gas)
      // 确认燃料(gas)是否够
      let userBalance = await web3.getBalance(owner.address)
      Log.info(`${ctx.uuid}|assetsOut().userBalance`, userBalance)
      if (userBalance == 0 || userBalance < gas) {
        throw new Error('系统无足够交易手续费GAS，请稍后再试')
      }

      // 调用web3转账
      let transRet = await web3.tokenTransfer(
        contract,
        owner,
        account.address,
        owner.address,
        num
      )
      Log.info(`${ctx.uuid}|assetsOut().transRet`, transRet)
      if (!transRet) {
        throw new Error('提币失败')
      }

      // 记录转账信息
      ctx.body.type = ctx.body.type || 2 // 交易类型:提现
      ctx.body.hash = transRet.transactionHash
      ctx.body.gas = transRet.cumulativeGasUsed
      let userTransRet = await userTransationService.transafer(ctx, t)
      Log.info(`${ctx.uuid}|assetsOut().userTransRet`, userTransRet)
      if (userTransRet.code !== 0) {
        throw new Error(transRet.message)
      }

    } catch (err) {
      console.log(err)
      Log.error(`${ctx.uuid}|assetsOut().transRet err`, err.message)
      ret.code = errCode.FAIL.code
      ret.message = err.message || 'err'
    }

    Log.info(`${ctx.uuid}|assetsOut().ret`, ret)

    ctx.result = ret
    return ret
  }

  async assetsToScore(ctx) {
    let ret = {
      code: errCode.SUCCESS.code,
      message: errCode.SUCCESS.message
    }

    try {
      Log.info(`${ctx.uuid}|assetsTransfer().body`, ctx.body)
      let userId = ctx.body.user_id // 鉴权通过了，不可能是0
      // let toAddress = ctx.body.to_address
      let num = ctx.body.num
      let password = ctx.body.password
      let type = 10

      let user = await UserModel()
        .model()
        .findById(userId)
      // let accountAddress = user.wallet_address
      if (user.password_trade != cryptoUtils.md5(password)) {
        if (user.password != cryptoUtils.md5(password)) {
          throw new Error('密码验证错误')
        }

      }

      let privateKey = user.private_key
      let account = await web3.getAccountFromPk(privateKey)

      let forzenNum = 0

      let {
        contract,
        owner
      } = await tokenService._info()

      let tokenBalance = await tokenService._getUserTokenBalance(account.address)
      if (tokenBalance - forzenNum < num) {
        throw new Error('代币可用余额不足')
      }

      // toAddress = StrUtils.reTransWalletAddress(addressReserve)
      let toAddress = owner.address
      Log.info(`${ctx.uuid}|assetsTransfer().toAddress reTransWalletAddress`, toAddress)
      let gas = await web3.tokenTransferGas(
        contract,
        owner,
        account.address,
        toAddress,
        num,
        true
      )
      Log.info(`${ctx.uuid}|assetsTransfer().gas`, gas)
      // 确认燃料(gas)是否够
      let userBalance = await web3.getBalance(owner.address)
      Log.info(`${ctx.uuid}|assetsTransfer().userBalance`, userBalance)
      if (userBalance == 0 || userBalance < gas) {
        throw new Error('系统无足够交易手续费GAS，请稍后再试')
      }

      // 调用web3转账
      let transRet = await web3.tokenTransfer(
        contract,
        owner,
        account.address,
        toAddress,
        num
      )

      Log.info(`${ctx.uuid}|assetsTransfer().transRet`, transRet)
      if (!transRet) {
        throw new Error('转账失败')
      }

      // 记录转账信息
      ctx.body.type = type // 交易类型:转账
      ctx.body.hash = transRet.transactionHash
      ctx.body.gas = transRet.cumulativeGasUsed
      let userTransRet = await userTransationService.transafer(ctx)

      Log.info(`${ctx.uuid}|assetsTransfer().userTransRet`, userTransRet)
      if (userTransRet.code !== 0) {
        throw new Error(transRet.message)
      }

      // 记录用户积分
      let userAssets = await UserModel().getAssetsByUserId(userId)
      let newScore = Math.ceil((userAssets.score + num / ScoreRate) * 100) / 100
      userAssets.score = newScore
      let saveScoreRet = await userAssets.save()
      if (!saveScoreRet) {
        throw new Error('更新积分失败')
      }
    } catch (err) {
      // console.log(err)
      ret.code = errCode.FAIL.code
      ret.message = err.message || 'err'
    }

    Log.info(`${ctx.uuid}|assetsTransfer().ret`, ret)
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

    let t = await UserModel().getTrans()
    try {
      Log.info(`${ctx.uuid}|assetsTransfer().body`, ctx.body)
      let userId = ctx.body.user_id // 鉴权通过了，不可能是0
      let toAddress = ctx.body.to_address
      let num = ctx.body.num
      let password = ctx.body.password
      let type = ctx.body.type || 3

      let user = await UserModel()
        .model()
        .findById(userId)
      // let accountAddress = user.wallet_address
      if (user.password_trade != cryptoUtils.md5(password)) {
        if (user.password != cryptoUtils.md5(password)) {
          throw new Error('密码验证错误')
        }

      }

      let addressReserve = StrUtils.transWalletAddress(toAddress)
      Log.info(`${ctx.uuid}|assetsTransfer().toAddress transWalletAddress`, addressReserve)
      let toUser = await UserModel()
        .model()
        .findOne({
          where: {
            // wallet_address: toAddress
            reserve_address: addressReserve
          }
        })
      if (type == 3) {

        if (!toUser || !toUser.id) {
          throw new Error('所转账至对方账户错误')
        } else {
          ctx.body.to_user_id = toUser.id
        }
      } else {
        if (toUser && toUser.id) {
          throw new Error('所转账至对方账户错误')
        }
        ctx.body.to_user_id = 0
      }


      let privateKey = user.private_key
      let account = await web3.getAccountFromPk(privateKey)

      // if (user.address != account.private_key) {
      //   throw new Error('私钥错误')
      // }

      // 确认是否足够代币
      // let userAssets = await UserModel().assetsModel().findOne({
      //   where: {
      //     user_id: userId
      //   }
      // })
      let forzenNum = 0
      // if (userAssets) {
      //   Log.info(`${ctx.uuid}|assetsOut().userAssets`, userAssets)
      //   forzenNum = userAssets.token_num_frozen
      //   Log.info(`${ctx.uuid}|assetsOut().forzenNum`, forzenNum)
      // }
      // let {
      //   address
      // } = await tokenService._info()
      // let contract = await web3.getContract(address)
      let {
        contract,
        owner
      } = await tokenService._info()

      //
      // let tokenBalance = await web3.getTokenBalance(address, account.address)
      let tokenBalance = await tokenService._getUserTokenBalance(account.address)
      // if (tokenBalance < num) {
      //   throw new Error('代币余额不足')
      // }
      if (tokenBalance - forzenNum < num) {
        throw new Error('代币可用余额不足')
      }

      toAddress = StrUtils.reTransWalletAddress(addressReserve)
      Log.info(`${ctx.uuid}|assetsTransfer().toAddress reTransWalletAddress`, toAddress)
      let gas = await web3.tokenTransferGas(
        contract,
        owner,
        account.address,
        toAddress,
        num,
        true
      )
      Log.info(`${ctx.uuid}|assetsTransfer().gas`, gas)
      // 确认燃料(gas)是否够
      let userBalance = await web3.getBalance(owner.address)
      Log.info(`${ctx.uuid}|assetsTransfer().userBalance`, userBalance)
      if (userBalance == 0 || userBalance < gas) {
        throw new Error('系统无足够交易手续费GAS，请稍后再试')
      }

      // 调用web3转账
      let transRet = null
      if (type == 2) {

        let gas1 = await web3.tokenTransferToGas(
          contract,
          owner,
          toAddress,
          num,
          true
        )

        gas += gas1
        Log.info(`${ctx.uuid}|assetsTransfer().gas`, gas)
        // 确认燃料(gas)是否够
        let userBalance = await web3.getBalance(owner.address)
        Log.info(`${ctx.uuid}|assetsTransfer().userBalance`, userBalance)
        if (userBalance == 0 || userBalance < gas) {
          throw new Error('系统无足够交易手续费GAS，请稍后再试')
        }

        // 从用户账户转到主账户
        let transRet1 = await web3.tokenTransfer(
          contract,
          owner,
          account.address,
          owner.address,
          num
        )

        if (!transRet1) {
          throw new Error('转账失败,请稍后重试')
        }

        // transRet = await web3.tokenTransferTo(
        //   contract,
        //   owner,
        //   toAddress,
        //   num
        // )

        let assetsOutRet = await UserModel().assetsOutModel().create({
          user_id: userId,
          to_address: toAddress,
          num: num,
          status: 0
        }, {
          transcation: t
        })
        if (!assetsOutRet) {
          throw new Error('申请提币失败')
        }

      } else {
        transRet = await web3.tokenTransfer(
          contract,
          owner,
          account.address,
          toAddress,
          num
        )

        Log.info(`${ctx.uuid}|assetsTransfer().transRet`, transRet)
        if (!transRet) {
          throw new Error('转账失败')
        }

        // 记录转账信息
        ctx.body.type = type // 交易类型:转账
        ctx.body.hash = transRet.transactionHash
        ctx.body.gas = transRet.cumulativeGasUsed
        let userTransRet = await userTransationService.transafer(ctx, t)

        Log.info(`${ctx.uuid}|assetsTransfer().userTransRet`, userTransRet)
        if (userTransRet.code !== 0) {
          throw new Error(transRet.message)
        }
      }

      t.commit()

    } catch (err) {
      console.log(err)
      ret.code = errCode.FAIL.code
      ret.message = err.message || 'err'

      t.rollback()
    }

    Log.info(`${ctx.uuid}|assetsTransfer().ret`, ret)
    ctx.result = ret
    return ret
  }

  async transactions(ctx) {
    let ret = {
      code: errCode.SUCCESS.code,
      message: errCode.SUCCESS.message
    }

    Log.info(`${ctx.uuid}|transactions().body`, ctx.body)
    let userId = ctx.body.user_id // 鉴权通过了，不可能是0
    let offset = ctx.body.offset || 0
    let limit = ctx.body.limit || 20

    let queryRet = await UserModel().transactionModel().findAndCountAll({
      where: {
        user_id: userId
      },
      order: [
        ['create_time', 'desc']
      ],
      offset: offset,
      limit: limit
    })

    ret.data = {
      rows: queryRet.rows,
      count: queryRet.count
    }
    Log.info(`${ctx.uuid}|transactions().ret`, ret)

    ctx.result = ret
    return ret
  }

  async investChildInfo(ctx) {
    let ret = {
      code: errCode.SUCCESS.code,
      message: errCode.SUCCESS.message
    }

    Log.info(`${ctx.uuid}|investchildInfo().body`, ctx.body)
    let userId = ctx.body.user_id // 鉴权通过了，不可能是0
    let childs = await UserModel().getAllChilds([userId])
    let ids = []
    let userInfos = {}
    let levels = {}

    for (let index = 0; index < childs.length; index++) {
      const child = childs[index]
      child.forEach(item => {
        ids.push(item.id)
        levels['lv_' + item.id] = index
        userInfos['ur_' + item.id] = item
      })

    }

    let investModel = InvestModel().model()
    let userInvestModel = UserModel().investModel()

    userInvestModel.belongsTo(investModel, {
      targetKey: 'id',
      foreignKey: 'invest_id'
    })
    let userInvests = await userInvestModel.findAll({
      where: {
        user_id: {
          [Op.in]: ids
        },
      },
      include: [{
        model: investModel,
        attributes: ['name']
      }],
      order: [
        ['create_time', 'desc']
      ]
    })

    let buyIds = []
    let lists = []
    userInvests.forEach(item => {
      let list = item.dataValues
      list.user = userInfos['ur_' + item.user_id]
      lists.push(list)
      if (buyIds.indexOf(item.user_id) < 0) {
        buyIds.push(item.user_id)
      }

    })

    let noBuyUser = []
    ids.forEach(id => {

      if (buyIds.indexOf(id) < 0) {
        console.log('============', id)
        noBuyUser.push(userInfos['ur_' + id])
      }
    })


    ret.data = {
      ids,
      levels,
      lists,
      buyIds,
      noBuyUser
    }
    Log.info(`${ctx.uuid}|investchildInfo().ret`, ret)

    ctx.result = ret
    return ret
  }


  async investChild(ctx) {
    let ret = {
      code: errCode.SUCCESS.code,
      message: errCode.SUCCESS.message
    }

    Log.info(`${ctx.uuid}|investChild().body`, ctx.body)
    let userId = ctx.body.user_id // 鉴权通过了，不可能是0
    let offset = ctx.body.offset || 0
    let limit = ctx.body.limit || 20

    let userInfoModel = UserModel().infoModel()
    let userModel = UserModel().model()
    let userInvestChildModel = UserModel().investChildModel()

    userInvestChildModel.belongsTo(userInfoModel, {
      targetKey: 'user_id',
      foreignKey: 'child_id'
    })
    userInvestChildModel.belongsTo(userModel, {
      targetKey: 'id',
      foreignKey: 'child_id'
    })
    let queryRet = await userInvestChildModel.findAndCountAll({
      where: {
        user_id: userId
      },
      order: [
        ['create_time', 'desc']
      ],
      include: [{
        model: userInfoModel,
        attributes: ['realname', 'avatar']
      }, {
        model: userModel,
        attributes: ['mobile']
      }],
      offset: offset,
      limit: limit
    })
    let childCount = await UserModel().model().count({
      where: {
        pid: userId,
        status: 1
      }
    })
    // let childInvest = await UserModel().investLogsModel().sum('num_child', {
    //   where: {
    //     user_id: userId
    //   }
    // })
    ret.data = {
      rows: queryRet.rows,
      count: queryRet.count,
      childCount: childCount
    }
    Log.info(`${ctx.uuid}|investChild().ret`, ret)

    ctx.result = ret
    return ret
  }

  /**
   * 设置交易密码
   * @param {*} ctx 
   */
  async setTradePwd(ctx) {
    let ret = {
      code: errCode.SUCCESS.code,
      message: errCode.SUCCESS.message
    }

    Log.info(`${ctx.uuid}|setTradePwd().body`, ctx.body)
    let userId = ctx.body.user_id // 鉴权通过了，不可能是0
    let password = ctx.body.password

    let user = await UserModel().model().findById(userId)
    user.password_trade = cryptoUtils.md5(password)
    let retSet = await user.save()

    if (!retSet) {
      ret.code = errCode.FAIL.code
      ret.message = '设置交易密码失败'
    }

    ret.message = '设置成功'

    ctx.result = ret
    return ret
  }

  async searchUserByMobile(ctx) {
    let ret = {
      code: errCode.SUCCESS.code,
      message: errCode.SUCCESS.message
    }

    Log.info(`${ctx.uuid}|searchUserByMobile().body`, ctx.body)
    let userId = ctx.body.user_id // 鉴权通过了，不可能是0
    let mobile = ctx.body.mobile

    let userModel = UserModel().model()
    let userInfoModel = UserModel().infoModel()

    userModel.hasOne(userInfoModel, {
      foreignKey: 'user_id'
    })

    let list = await userModel.findAll({
      where: {
        mobile: {
          [Op.like]: '%' + mobile
        },
        id: {
          [Op.ne]: userId
        },
        status: 1
      },
      include: [{
        model: userInfoModel,
        attributes: ['realname', 'avatar']
      }],
      order: [
        ['create_time', 'DESC']
      ],
      attributes: ['id', 'uuid', 'mobile', 'wallet_address', 'status', 'create_time']
    })

    list.forEach(item => {
      item.wallet_address = StrUtils.transWalletAddress(item.wallet_address)
    })

    ret.data = {
      list: list || []
    }
    Log.info(`${ctx.uuid}|searchUserByMobile().ret`, ret)
    ctx.result = ret
    return ret
  }

}

module.exports = new AccountService()