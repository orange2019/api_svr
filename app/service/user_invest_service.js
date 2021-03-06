const Log = require('./../../lib/log')('user_service')
const BaseModel = require('./../model/base_model')
const UserModel = require('./../model/user_model')
const InvestModel = require('./../model/invest_model')
const ConfigModel = require('./../model/config_model')
const accountService = require('./account_service')
const tokenService = require('./token_service')
const UuidUtils = require('./../utils/uuid_utils')
const dateUtils = require('./../utils/date_utils')
const errCode = require('./../common/err_code')
const cryptoUtils = require('./../utils/crypto_utils')
// const userTransactionService = require('./user_transaction_service')
const Op = require('sequelize').Op
// const uuid = require('uuid')
const DECIMALS = require('./../../config').decimals

const {
  INVEST_RATES
} = require('./../../config')

class UserInvestService {

  async list(ctx) {
    let ret = {
      code: errCode.SUCCESS.code,
      message: errCode.SUCCESS.message
    }
    Log.info(`${ctx.uuid}|list().body`, ctx.body)

    let list = await InvestModel().model().findAll({
      where: {
        status: 1
      },
      order: [
        ['sort', 'asc'],
        ['rate', 'desc']
      ]
    })

    ret.data = {
      list: list
    }
    Log.info(`${ctx.uuid}|list().ret`, ret)
    ctx.result = ret
    return ret
  }

  async info(ctx) {
    let ret = {
      code: errCode.SUCCESS.code,
      message: errCode.SUCCESS.message
    }
    Log.info(`${ctx.uuid}|info().body`, ctx.body)

    let userId = ctx.body.user_id
    let investId = ctx.body.invest_id

    let invest = await InvestModel().model().findById(investId)

    let user = await this.getById(ctx, userId)

    let userAssets = await UserModel().getAssetsByUserId(userId)
    Log.info(ctx.uuid, 'info().userAssets', userAssets.token_num_frozen)

    let tokenBalance = await tokenService._getUserTokenBalance(user.wallet_address)
    Log.info(ctx.uuid, 'info().tokenBalance', tokenBalance)

    // let canUseNum = tokenBalance - userAssets.token_num_frozen
    let canUseNum = tokenBalance
    Log.info(ctx.uuid, 'info().canUseNum', canUseNum)

    ret.data = {
      invest: invest,
      canUseNum: canUseNum,
      tokenBalance: tokenBalance,
      isSetTradePwd: user.password_trade ? 1 : 0
    }

    Log.info(`${ctx.uuid}|info().ret`, ret)
    ctx.result = ret
    return ret
  }

  async getList(ctx) {
    let ret = {
      code: errCode.SUCCESS.code,
      message: errCode.SUCCESS.message
    }
    Log.info(`${ctx.uuid}|getList().body`, ctx.body)

    let userId = ctx.body.user_id
    let now = parseInt(Date.now() / 1000)

    let investUserModel = UserModel().investModel()
    let investModel = InvestModel().model()

    investUserModel.belongsTo(investModel, {
      targetKey: 'id',
      foreignKey: 'invest_id'
    })
    let list = await investUserModel.findAll({
      where: {
        user_id: userId,
        end_time: {
          [Op.gt]: now
        }
      },
      include: [{
        model: investModel,
        attributes: ['name']
      }]
    })

    ret.data = {
      list: list
    }
    ctx.result = ret
    Log.info(`${ctx.uuid}|getList().ret`, ret)
    return
  }

  async getDetail(ctx) {
    let ret = {
      code: errCode.SUCCESS.code,
      message: errCode.SUCCESS.message
    }
    Log.info(`${ctx.uuid}|getList().body`, ctx.body)

    let userId = ctx.body.user_id
    let uuid = ctx.body.uuid

    let info = await UserModel().investModel().findOne({
      where: {
        user_id: userId,
        uuid: uuid
      }
    })
    let invest = await InvestModel().model().findById(info.invest_id)
    let sum = await UserModel().investLogsModel().sum('num_self', {
      where: {
        user_id: userId,
        user_invest_id: info.id
      }
    })
    let count = await UserModel().investLogsModel().count({
      where: {
        user_id: userId,
        user_invest_id: info.id
      }
    })

    let investTotal = parseInt(invest.num * invest.rate / 100 * DECIMALS) / DECIMALS
    let investTotalLeave = investTotal - (sum / DECIMALS)

    ret.data = {
      info: info,
      invest: invest,
      sum: (sum / DECIMALS) || 0,
      count: count || 0,
      investTotal: investTotal || 0,
      investTotalLeave: investTotalLeave || investTotal
    }

    Log.info(`${ctx.uuid}|getList().ret`, ret)
    ctx.result = ret
    return ret

  }


  /**
   * 投产
   */
  async investApply(ctx) {
    let ret = {
      code: errCode.SUCCESS.code,
      message: errCode.SUCCESS.message
    }

    let t = await UserModel().getTrans()

    try {
      Log.info(`${ctx.uuid}|investApply().body`, ctx.body)
      let userId = ctx.body.user_id
      let investId = ctx.body.invest_id
      let password = ctx.body.password || ''

      // 找到用户
      let user = await this.getById(ctx, userId)
      Log.info(ctx.uuid, 'investApply().user', user)
      if (!user) {
        throw new Error('未找到用户')
      }

      let invest = await InvestModel().model().findById(investId)
      if (!invest) {
        throw new Error('无效产品')
      }

      // 判断数量
      let now = parseInt(Date.now() / 1000)
      let count = await UserModel().investModel().count({
        where: {
          user_id: userId,
          start_time: {
            [Op.lt]: now
          },
          end_time: {
            [Op.gt]: now
          }
        }
      })
      if (count >= 2) {
        throw new Error('超过购买限制:2个')
      }

      // 判断密码
      if (user.password_trade != cryptoUtils.md5(password)) {
        if (user.password != cryptoUtils.md5(password)) {
          throw new Error('密码错误')
        }

      }

      // 判断资产是否足够
      let tokenNum = invest.num
      Log.info(ctx.uuid, 'investApply().tokenNum', tokenNum)
      let userAssets = await UserModel().getAssetsByUserId(userId)
      Log.info(ctx.uuid, 'investApply().userAssets', userAssets.token_num_frozen)

      let tokenBalance = await tokenService._getUserTokenBalance(user.wallet_address)
      Log.info(ctx.uuid, 'investApply().tokenBalance', tokenBalance)

      // let canUseNum = tokenBalance - userAssets.token_num_frozen
      let canUseNum = tokenBalance
      Log.info(ctx.uuid, 'investApply().canUseNum', canUseNum)

      if (canUseNum <= 0 || canUseNum < tokenNum) {
        throw new Error('用户资产不足')
      }

      // 添加投产记录 
      let startTime = parseInt(Date.now() / 1000)
      let endTime = startTime + (invest.days * 24 * 3600)
      let userInvestData = {
        user_id: userId,
        invest_id: investId,
        start_time: startTime,
        end_time: endTime,
        rate: invest.rate,
        days: invest.days,
        num: invest.num
      }
      Log.info(ctx.uuid, 'investApply().userInvestData', userInvestData)
      let retUserInvest = await UserModel().investModel().create(userInvestData, {
        transaction: t
      })
      Log.info(ctx.uuid, 'investApply().userInvestData', retUserInvest.id)
      if (!retUserInvest) {
        throw new Error('添加数据失败')
      }

      // 记录用户资产
      // const decimals = 100000000
      let newNum = (userAssets.token_num_frozen * DECIMALS + tokenNum * DECIMALS) / DECIMALS
      Log.info(ctx.uuid, 'investApply().newNum', newNum)
      userAssets.token_num_frozen = newNum
      let retUserAssests = await userAssets.save({
        transaction: t
      })
      if (!retUserAssests) {
        throw new Error('记录用户数据失败')
      }

      // 交易记录
      ctx.body.type = 4
      ctx.body.num = invest.num
      let userAssetsOutRet = await accountService.assetsOut(ctx, t)
      if (userAssetsOutRet.code != 0) {
        throw new Error(userAssetsOutRet.message)
      }
      // let userTransRet = await userTransactionService.transafer(ctx, t)
      // if (userTransRet.code != 0) {
      //   throw new Error(userTransRet.message)
      // }


    } catch (err) {
      // console.error(err.message)
      ret.code = errCode.FAIL.code
      ret.message = err.message || 'err'

      t.rollback()
      ctx.result = ret
      return ret
    }

    Log.info(`${ctx.uuid}|investApply().ret`, ret)
    t.commit()
    ctx.result = ret
    return ret


  }

  /**
   * 计算
   */
  async investComputes() {
    let log = arguments[0] || Log
    let self = this
    let now = parseInt(Date.now() / 1000)
    // let now = 1546919050
    let userInvests = await UserModel().investModel().findAll({
      where: {
        start_time: {
          [Op.lt]: now
        },
        end_time: {
          [Op.gt]: now
        }
      },
      order: [
        ['create_time', 'ASC']
      ]
    })
    log.info('investComputes.userInvests.len', userInvests.length)

    let userInvestIds = []
    for (let index = 0; index < userInvests.length; index++) {
      const userInvest = userInvests[index]
      let userId = userInvest.user_id
      let isFirst = false
      if (userInvestIds.indexOf(userId) < 0) {
        userInvestIds.push(userId)
        isFirst = true
      }
      await self.investComputed(userInvest, isFirst, now, log)
    }

    return true

  }

  async investComputed(userInvest, isFirst = false, now = null) {
    let log = arguments[3] || Log
    log.info(`计算 start ID:${userInvest.id}`)
    let logDate = dateUtils.dateFormat(now, 'YYYYMMDD')

    let userId = userInvest.user_id
    let investId = userInvest.user_id
    let userInvestId = userInvest.id

    let isLog = await UserModel().investLogsModel().findOne({
      where: {
        user_invest_id: userInvestId,
        log_date: logDate
      }
    })
    if (isLog) {
      log.info('已记录......', isLog.id)
      return false
    }

    let baseNum = userInvest.num
    let rate = userInvest.rate
    let days = userInvest.days

    let userAssets = await UserModel().getAssetsByUserId(userId)
    let userAssetsFrozen = userAssets.token_num_frozen

    let numFrozen = baseNum / days
    if (userAssetsFrozen - numFrozen < 1) {
      numFrozen = Math.ceil(numFrozen)
    }

    // 自己收益
    let numSelf = baseNum * rate / 100 / days
    let numChild = 0

    if (isFirst) {
      // TODO 去找子级的
      numChild = await this._computedChild(userId, baseNum, now, log)
    }

    let logsData = {
      user_id: userId,
      invest_id: investId,
      user_invest_id: userInvestId,
      num_frozen: numFrozen,
      num_self: numSelf,
      num_child: numChild,
      log_date: dateUtils.dateFormat(now, 'YYYYMMDD')
    }
    log.info('logsData', logsData)
    let logRet = await UserModel().investLogsModel().create(logsData)
    log.info('logRet', logRet.id)


    let numTokenInc = numSelf + numChild + numFrozen
    log.info('numTokenInc', numTokenInc)
    // 收益
    let ctx = {
      uuid: UuidUtils.v4(),
      body: {
        user_id: userId,
        num: numSelf,
        type: 5
      }
    }
    let retAssetsIn = await accountService.assetsIn(ctx)
    log.info('retAssetsIn', retAssetsIn)
    // 投入解冻
    let ctx1 = {
      uuid: UuidUtils.v4(),
      body: {
        user_id: userId,
        num: numFrozen,
        type: 9
      }
    }
    let retAssetsIn1 = await accountService.assetsIn(ctx1)
    log.info('retAssetsIn1', retAssetsIn1)
    // 子级收益
    if (numChild) {
      let ctx = {
        uuid: UuidUtils.v4(),
        body: {
          user_id: userId,
          num: numChild,
          type: 6
        }
      }
      let retAssetsIn = await accountService.assetsIn(ctx)
      log.info('retAssetsInChild', retAssetsIn)
    }

    // const decimals = 100000000
    // 计算当日的
    userAssets.token_num_frozen = (userAssets.token_num_frozen * DECIMALS - numFrozen * DECIMALS) / DECIMALS
    let userAssetsRet = await userAssets.save()
    log.info('userAssetsRet.id', userAssetsRet.id)


  }

  async _computedChild(pid, baseNum, now = null) {
    let log = arguments[3] || Log

    if (!now) {
      now = parseInt(Date.now() / 1000)
    }
    let rateLevels = await ConfigModel().getRateLevel()

    let childs = await UserModel().getAllChilds([pid])
    let child0 = childs[0] || [] // 子级
    let childInvestUserIds = [] // 推荐下级购买的记录ids

    if (child0 && child0.length) {
      log.info('child0.len', child0.length)
      let userIds = []
      child0.forEach(child => {
        userIds.push(child.id)
      })
      let childInvest = await UserModel().investModel().findAll({
        where: {
          user_id: {
            [Op.in]: userIds
          },
          start_time: {
            [Op.lt]: now
          },
          end_time: {
            [Op.gt]: now
          }
        }
      })

      childInvest.forEach(item => {
        if (childInvestUserIds.indexOf(item.user_id) < 0) {
          childInvestUserIds.push(item.user_id)
        }
      })

    } else {
      return false
    }
    log.info('childInvestUserIds', childInvestUserIds.length)
    let level = 0
    if (childInvestUserIds.length > 0 && childInvestUserIds.length <= 1) {
      // 享受下一级
      level = 1
    } else if (childInvestUserIds.length > 1 && childInvestUserIds.length <= 2) {
      // 享受两级
      level = 2
    } else if (childInvestUserIds.length > 2) {
      level = childs.length
    }
    log.info('level:', level)
    log.info('childs =======', childs)
    // level = childs.length
    let numChild = 0
    for (let index = 0; index < level; index++) {
      const childArr = childs[index]
      if (!childArr || !childArr.length) {
        continue
      }

      log.info('childArr ==== ', index, childArr)
      // console.log('childArr len', childArr)
      for (let indexC = 0; indexC < childArr.length; indexC++) {
        const child = childArr[indexC]
        log.info('child ', child.id)
        let investUserChilds = await UserModel().investModel().findAll({
          where: {
            user_id: child.id,
            start_time: {
              [Op.lt]: now
            },
            end_time: {
              [Op.gt]: now
            }
          }
        })

        investUserChilds.forEach(item => {
          log.info('rate level ', rateLevels[index] || 0.1)
          log.info('item.num', item.num)
          let itemNum = this._computedOneDay(item)
          log.info('numChild:add:itemNum', itemNum)
          let addNum = ((itemNum > baseNum) ? baseNum : itemNum) * (rateLevels[index] || 0.1) / 100
          numChild += addNum
          log.info('numChild:add:', addNum)
          UserModel().recordChildInvest(pid, child.id, addNum).then(ret => {
            log.info('numChild:add:ret', ret.id)
          })
        })
      }

    }

    log.info('numChild:end:', numChild)
    return (numChild > baseNum) ? baseNum : numChild

  }

  _computedOneDay(item) {
    return (item.num / item.days) + (item.num * item.rate / 100 / item.days)
  }

  /**
   * 计算收益
   */
  // async compute() {
  //   let logger = require('./../../lib/log')('compute')
  //   let investLogsModel = UserModel().investLogsModel()
  //   let count = await UserModel().formulaModel().count()
  //   logger.info('compute().start|count:', count)


  //   let limit = 10
  //   let page = Math.ceil(count / limit)
  //   let investFormula = {}
  //   let now = parseInt(Date.now() / 1000)
  //   logger.info('compute().page', page)

  //   let ret = {
  //     success: [],
  //     fail: []
  //   }

  //   let user

  //   for (let index = 0; index < page; index++) {
  //     let offset = index * limit
  //     let items = await UserModel().formulaModel().findAll({
  //       offset: offset,
  //       limit: limit
  //     })

  //     for (let j = 0; j < items.length; j++) {

  //       let item = items[j]
  //       let level = -1
  //       let userId = item.user_id

  //       try {
  //         // 判断是否结算
  //         let isLog = false
  //         let count = await investLogsModel.count({
  //           where: {
  //             user_id: userId,
  //             log_date: dateUtils.dateFormat(null, 'YYYYMMDD')
  //           }
  //         })
  //         isLog = count || 0

  //         if (isLog) {
  //           ret.success.push(userId)
  //           continue
  //         }

  //         investFormula = item.invest_formula
  //         if (!investFormula || !investFormula.hasOwnProperty('lv_0')) {
  //           logger.info(`${userId}|无投产`)
  //           ret.fail.push(userId)
  //           continue
  //         }

  //         // 计算lv_0的投产状况
  //         let selfNumUnfrozen = 0
  //         let selfNumInvest = 0
  //         let baseNum = 0

  //         let selfFormulas = investFormula.lv_0['u_' + userId]
  //         for (let index = 0; index < selfFormulas.length; index++) {
  //           let selfFormula = selfFormulas[index]
  //           if (selfFormula.st < now && selfFormula.et > now) {

  //             selfNumUnfrozen += selfFormula.num / selfFormula.days

  //             selfNumInvest += selfFormula.num * selfFormula.rate / selfFormula.days / 100
  //             if (!baseNum) baseNum = selfFormula.num

  //           }
  //         }

  //         if (!baseNum) {
  //           logger.info(`${userId}|无有效投产`)
  //           ret.fail.push(userId)
  //           continue
  //         }

  //         // 计算自己的
  //         logger.info(`${userId}|解冻资产${selfNumUnfrozen}`)
  //         logger.info(`${userId}|解冻收益${selfNumInvest}`)

  //         // if (!investFormula.hasOwnProperty('lv_1')) {
  //         //   logger.info(`${userId}|无推荐投产`)
  //         //   ret.fail.push(userId)
  //         //   continue
  //         // }

  //         let childsNum = investFormula.hasOwnProperty('lv_1') ? Object.keys(investFormula.lv_1).length : 0
  //         if (childsNum == 0) {
  //           level = 0
  //         } else if (childsNum >= 1 && childsNum < 3) {
  //           level = 1
  //         } else if (childsNum >= 3 && childsNum < 5) {
  //           level = 2
  //         } else {
  //           level = Object.keys(investFormula).length
  //         }

  //         let childNumInvest = 0
  //         let levelDataArr = Object.values(investFormula)
  //         logger.info(`${userId}|levelData.len:`, Object.keys(investFormula).length)
  //         logger.info(`${userId}|levelData.computeLen:`, level)

  //         for (let indexLevel = 1; indexLevel <= level; indexLevel++) {
  //           let levelData = levelDataArr[indexLevel] || null
  //           if (levelData) {

  //             let childFormulaArr = Object.values(levelData)
  //             logger.info(`${userId}|level:${level}|childData.len:`, childFormulaArr.length)

  //             for (let indexCf = 0; indexCf < childFormulaArr.length; indexCf++) {
  //               let childFormulas = childFormulaArr[indexCf]
  //               logger.info(`${userId}|level:${level}|childFormulas.len`, childFormulas.length)

  //               for (let indexC = 0; indexC < childFormulas.length; indexC++) {
  //                 let childFormula = childFormulas[indexC]
  //                 logger.info(`${userId}|level:${level}|childFormula`, childFormula)

  //                 if (childFormula.st < now && childFormula.et > now) {
  //                   let childFormulaNum = (baseNum > childFormula.num) ? childFormula.num : baseNum // 下级购买数量大于自己，使用自己的作为基数
  //                   childNumInvest += childFormulaNum * childFormula.rate / 100
  //                   // childNumInvest += childFormula.num * childFormula.rate / 100 / childFormula.days // TODO是否除以天数  
  //                 }

  //               }
  //             }
  //           }

  //         }

  //         logger.info(`${userId}|childNumInvest:`, childNumInvest)
  //         childNumInvest = (childNumInvest > baseNum) ? baseNum : childNumInvest

  //         let investNum = selfNumInvest + selfNumUnfrozen + childNumInvest
  //         logger.info(`${userId}|investNum:`, investNum)

  //         ret.success.push(userId)

  //         await investLogsModel.create({
  //           user_id: userId,
  //           num: investNum,
  //           num_frozen: selfNumUnfrozen,
  //           num_self: selfNumInvest,
  //           num_child: childNumInvest
  //         })

  //         // 链上转币
  //         let tokenNum = selfNumInvest + childNumInvest
  //         let ctx = {
  //           uuid: UuidUtils.v4(),
  //           body: {
  //             user_id: userId,
  //             num: tokenNum,
  //             type: 4
  //           }
  //         }
  //         let retAssetsIn = await accountService.assetsIn(ctx)
  //         logger.info(`${userId}|retAssetsIn`, retAssetsIn)

  //         user = await UserAssetsModel().model().findById(userId)
  //         // user.token_num = user.token_num + investNum
  //         // const decimals = 100000000
  //         user.token_num_frozen = (user.token_num_frozen * DECIMALS - selfNumUnfrozen * DECIMALS) / DECIMALS
  //         await user.save()

  //       } catch (err) {
  //         console.log(err)
  //         logger.info(`${userId}|err:`, err)
  //         ret.fail.push(userId)
  //       }

  //     }
  //   }

  //   return ret
  // }

  /**
   * 投产
   * @param {*} ctx 
   * @param {
   *  num ： 数量
   *  rate: 收益率
   *  days： 天数
   * } investData 
   */
  async invest(ctx) {

    let ret = {
      code: errCode.SUCCESS.code,
      message: errCode.SUCCESS.message
    }

    // 开启事务
    let baseModel = new BaseModel()
    let t = await baseModel.getTrans()

    try {
      let userId = ctx.body.user_id
      let investData = ctx.body.invest_data
      let password = ctx.body.password
      let tokenNum = investData.num

      // 找到用户
      let user = await this.getById(ctx, userId)
      Log.info(ctx.uuid, 'invest().user', user)
      if (!user) {
        throw new Error('未找到用户')
      }

      // 判断密码
      if (user.password != cryptoUtils.md5(password)) {
        throw new Error('密码错误')
      }

      // 判断资产是否足够
      // let userAssets = await this.getAssestByUserId(ctx, userId)
      let tokenBalance = await tokenService._getUserTokenBalance(user.address)
      Log.info(ctx.uuid, 'invest().tokenBalance', tokenBalance)
      if (!tokenBalance || tokenBalance < tokenNum) {
        throw new Error('用户资产不足')
      }

      // 设置自己的收益计算公式
      let selfFormula = await this.setUserFormula(ctx, userId, investData, userId, 0, t)
      Log.info(ctx.uuid, 'invest().selfFormula', selfFormula)
      if (!selfFormula) {
        throw new Error('设置自己收益数据失败')
      }

      if (user.pid != 0) {
        // 找到所有父级用户
        let fUsers = await this.getAllToRoot(ctx, user.pid)
        Log.info(ctx.uuid, 'invest().fUsers', fUsers)

        // 设置父级的收益计算公式
        for (let index = 0; index < fUsers.length; index++) {
          const fUser = fUsers[index]
          let fUserFormula = await this.setUserFormula(ctx, fUser.id, investData, userId, index + 1, t)
          if (!fUserFormula) {
            throw new Error(`设置用户${fUser.id}收益数据失败@userID:${userId}`)
          }
        }

      }

      // 更新资产
      let userAssets = await this.getAssestByUserId(ctx, userId)
      // const decimals = 100000000
      let newNumFrozen = (userAssets.token_num_frozen * DECIMALS + tokenNum * DECIMALS) / DECIMALS
      let userAssetUpdate = await userAssets.update({
        token_num_frozen: newNumFrozen
      }, {
        transaction: t
      })
      Log.info(ctx.uuid, 'invest().userAssetUpdate', userAssetUpdate)
      if (!userAssetUpdate) {
        throw new Error('更新用户资产失败')
      }

    } catch (err) {
      ret.code = errCode.FAIL.code
      ret.message = err.message || 'err'

      t.rollback()
      ctx.result = ret
      return ret
    }

    t.commit()
    return ret

  }

  /**
   * 通过用户id找用户
   * @param {*} ctx 
   * @param {*} id 
   */
  async getById(ctx, id) {

    let ret = await UserModel().model().findById(id)
    Log.info(ctx.uuid, 'getById().ret', ret)
    return ret
  }

  async getUserByPid(ctx, pid) {
    if (pid == 0) {
      return []
    }

    let user = await UserModel().model().findById(pid)
    return user
  }

  /**
   * 获取所有上级
   * @param {*} ctx 
   * @param {*} pid 
   * @param {*} users 
   */
  async getAllToRoot(ctx, pid, users = []) {
    let user = await this.getUserByPid(ctx, pid)
    if (!user || (user && user.pid == 0)) {
      users.push(user)
      return users
    } else {
      users.push(user)
      return await this.getAllToRoot(ctx, user.pid, users)
    }
  }

  /**
   * 获取用户资产数据
   * @param {*} ctx 
   * @param {*} userId 
   */
  async getAssestByUserId(ctx, userId) {
    let ret = await UserAssetsModel().model().findOne({
      where: {
        user_id: userId
      }
    })
    if (!ret) {
      ret = await UserAssetsModel().model().create({
        user_id: userId
      })
    }

    return ret
  }



  /**
   * 设置用户收益计算公式
   * @param {*} ctx 
   * @param {*} userId 
   * @param {
   *  num: 10000
   *  rate: 6
   *  days: 30
   * } investData 
   * @param {*} level 
   */
  async setUserFormula(ctx, userId, investData, levelUserId, level = 0, t = null) {
    Log.info(ctx.uuid, 'setUserFormula()', userId, investData, levelUserId, level)
    investData.rate = INVEST_RATES[level] || 0.1

    let userFormula = await this.getFormulaByUserId(ctx, userId)
    Log.info(ctx.uuid, 'setUserFormula().userFormula', userFormula)

    let formula = userFormula ? userFormula.invest_formula : {}

    let levelData = formula && formula.hasOwnProperty('lv_' + level) ? formula['lv_' + level] : {}
    let userData = (levelData && levelData.hasOwnProperty('u_' + levelUserId)) ? levelData['u_' + levelUserId] : []

    Log.info(ctx.uuid, 'setUserFormula().userData', userData)

    let startTime = parseInt(Date.now() / 1000)
    let endTime = startTime + (investData.days + 1) * 24 * 3600 - 100

    userData.push({
      num: investData.num,
      rate: investData.rate,
      st: startTime,
      et: endTime,
      days: investData.days
    })

    levelData['u_' + levelUserId] = userData
    formula['lv_' + level] = levelData
    Log.info(ctx.uuid, 'setUserFormula().formula', formula)

    let opts = {}
    if (t) opts.transaction = t
    if (userFormula) {
      let ret = await userFormula.update({
        invest_formula: formula
      }, opts)
      return ret
    } else {
      let ret = await UserModel().formulaModel().create({
        user_id: userId,
        invest_formula: formula
      }, opts)
      return ret
    }
    // return formula
  }

  /**
   * 获取用户收益计算数据
   * @param {*} ctx 
   * @param {*} userId 
   */
  async getFormulaByUserId(ctx, userId) {
    let ret = await UserModel().formulaModel().findById(userId)
    Log.info(ctx.uuid, 'getFormulaByUserId().ret', ret)
    return ret
  }

  /**
   * 获取信息
   * @param {*} ctx 
   */
  async investInfoAndLogs(ctx) {
    let ret = {
      code: errCode.SUCCESS.code,
      message: errCode.SUCCESS.message
    }

    Log.info(`${ctx.uuid}|investInfoAndLogs().body`, ctx.query)
    let userId = ctx.query.user_id || 0
    let investModel = InvestModel().model()
    let userInvestModel = UserModel().investModel()

    userInvestModel.belongsTo(investModel, {
      targetKey: 'id',
      foreignKey: 'invest_id'
    })
    let list = await userInvestModel.findAll({
      where: {
        user_id: userId,
      },
      include: [{
        model: investModel,
        attributes: ['name']
      }],
      order: [
        ['create_time', 'desc']
      ]
    })

    Log.info(`${ctx.uuid}|investInfoAndLogs().list`, list)
    ret.data = {
      list: list
    }
    ctx.result = ret

    return ret
  }


}

module.exports = new UserInvestService()