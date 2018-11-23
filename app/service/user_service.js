const Log = require('./../../lib/log')('user_service')
const BaseModel = require('./../model/base_model')
const UserModel = require('./../model/user_model')
const UserAssetsModel = require('./../model/user_assets_model')
const UuidUtils = require('./../utils/uuid_utils')
const dateUtils = require('./../utils/date_utils')
const errCode = require('./../common/err_code')
const {
  INVEST_RATES
} = require('./../../config')

class UserService {

  /**
   * 计算收益
   */
  async compute() {
    let logger = require('./../../lib/log')('compute')
    let investLogsModel = UserModel().investLogsModel()
    let count = await UserModel().formulaModel().count()
    logger.info('compute().start|count:' , count)

    
    let limit = 10
    let page = Math.ceil(count / limit)
    let investFormula = {}
    let now = parseInt(Date.now() / 1000)
    logger.info('compute().page' , page)

    let ret = {
      success: [],
      fail: []
    }

    let user

    for (let index = 0; index < page; index++) {
      let offset = index * limit
      let items = await UserModel().formulaModel().findAll({
        offset: offset,
        limit: limit
      })

      for (let j = 0; j < items.length; j++) {

        let item = items[j];
        let level = -1
        let userId = item.user_id

        try {
          // 判断是否结算
          let isLog = false
          let count = await investLogsModel.count({
            where: {
              user_id: userId,
              log_date: dateUtils.dateFormat(null, 'YYYYMMDD')
            }
          })
          isLog = count || 0

          if (isLog) {
            ret.success.push(userId)
            continue
          }

          investFormula = item.invest_formula
          if (!investFormula || !investFormula.hasOwnProperty('lv_0')) {
            logger.info(`${userId}|无投产`)
            ret.fail.push(userId)
            continue
          }

          // 计算lv_0的投产状况
          let selfNumUnfrozen = 0
          let selfNumInvest = 0
          let baseNum = 0

          let selfFormulas = investFormula.lv_0['u_' + userId]
          for (let index = 0; index < selfFormulas.length; index++) {
            let selfFormula = selfFormulas[index]
            if (selfFormula.st < now && selfFormula.et > now) {
              
              selfNumUnfrozen += selfFormula.num / selfFormula.days
              
              selfNumInvest += selfFormula.num * selfFormula.rate / selfFormula.days / 100
              if (!baseNum) baseNum = selfFormula.num

            }
          }

          if (!baseNum) {
            logger.info(`${userId}|无有效投产`)
            ret.fail.push(userId)
            continue
          }

          // 计算自己的
          logger.info(`${userId}|解冻资产${selfNumUnfrozen}`)
          logger.info(`${userId}|解冻收益${selfNumInvest}`)

          // if (!investFormula.hasOwnProperty('lv_1')) {
          //   logger.info(`${userId}|无推荐投产`)
          //   ret.fail.push(userId)
          //   continue
          // }

          let childsNum = investFormula.hasOwnProperty('lv_1') ? Object.keys(investFormula.lv_1).length : 0
          if (childsNum == 0) {
            level = 0
          } else if (childsNum >= 1 && childsNum < 3) {
            level = 1
          } else if (childsNum >= 3 && childsNum < 5) {
            level = 2
          } else {
            level = Object.keys(investFormula).length
          }

          let childNumInvest = 0
          let levelDataArr = Object.values(investFormula)
          logger.info(`${userId}|levelData.len:`, Object.keys(investFormula).length)
          logger.info(`${userId}|levelData.computeLen:`, level)

          for (let indexLevel = 1; indexLevel <= level; indexLevel++) {
            let levelData = levelDataArr[indexLevel] || null
            if (levelData) {

              let childFormulaArr = Object.values(levelData)
              logger.info(`${userId}|level:${level}|childData.len:`, childFormulaArr.length)

              for (let indexCf = 0; indexCf < childFormulaArr.length; indexCf++) {
                let childFormulas = childFormulaArr[indexCf]
                logger.info(`${userId}|level:${level}|childFormulas.len`, childFormulas.length)

                for (let indexC = 0; indexC < childFormulas.length; indexC++) {
                  let childFormula = childFormulas[indexC]
                  logger.info(`${userId}|level:${level}|childFormula`, childFormula)

                  if (childFormula.st < now && childFormula.et > now) {
                    // childNumInvest += childFormula.num * childFormula.rate / 100
                    childNumInvest += childFormula.num * childFormula.rate / 100 / childFormula.days // TODO是否除以天数  
                  }

                }
              }
            }

          }

          logger.info(`${userId}|childNumInvest:`, childNumInvest)
          childNumInvest = (childNumInvest > baseNum) ? baseNum : childNumInvest

          let investNum = selfNumInvest + selfNumUnfrozen + childNumInvest
          logger.info(`${userId}|investNum:`, investNum)

          ret.success.push(userId)

          await investLogsModel.create({
            user_id: userId,
            num : investNum,
            num_frozen : selfNumUnfrozen,
            num_self : selfNumInvest,
            num_child : childNumInvest
          })

          user = await UserAssetsModel().model().findById(userId)
          user.fod_num = user.fod_num + investNum
          user.fod_num_frozen = user.fod_num_frozen - selfNumUnfrozen
          await user.save()

        } catch (err) {
          console.log(err)
          logger.info(`${userId}|err:`, err)
          ret.fail.push(userId)
        }

      }
    }

    return ret
  }
  /**
   * 投产
   * @param {*} ctx 
   * @param {*} userId 
   * @param {
   *  num:
   * } investData 
   */
  async invest(ctx, userId, investData) {

    let fodNum = investData.num
    let ret = {
      code: errCode.SUCCESS.code,
      message: errCode.SUCCESS.message,
      data: {}
    }

    // 找到用户
    let user = await this.getById(ctx, userId)
    Log.info(ctx.uuid, 'invest().user', user)
    if (!user) {
      ret.code = 200001
      ret.message = '未找到用户'
      return ret
    }

    // 判断资产是否足够
    let userAssets = await this.getAssestByUserId(ctx, userId)
    Log.info(ctx.uuid, 'invest().userAssets', userAssets)
    if (!userAssets || userAssets.fod_num < fodNum) {
      ret.code = 200002
      ret.message = '用户资产不足'
      return ret
    }

    // 开启事务
    let baseModel = new BaseModel()
    let t = await baseModel.getTrans()

    // 设置自己的收益计算公式
    let selfFormula = await this.setUserFormula(ctx, userId, investData, userId, 0, t)
    Log.info(ctx.uuid, 'invest().selfFormula', selfFormula)
    if (!selfFormula) {
      ret.code = 200003
      ret.message = '设置自己收益数据失败'

      t.rollback()
      return ret
    }

    if (user.pid != 0) {
      // 找到所有父级用户
      let fUsers = await this.getAllToRoot(ctx, user.pid)
      Log.info(ctx.uuid, 'invest().fUsers', fUsers)

      // 设置父级的收益计算公式
      for (let index = 0; index < fUsers.length; index++) {
        const fUser = fUsers[index];
        let fUserFormula = await this.setUserFormula(ctx, fUser.id, investData, userId, index + 1, t)
        if (!fUserFormula) {
          ret.code = 200003
          ret.message = `设置用户${fUser.id}收益数据失败@userID:${userId}`

          t.rollback()
          return ret
        }
      }

    }

    // 更新资产
    let userAssetUpdate = await userAssets.update({
      fod_num: userAssets.fod_num - fodNum,
      fod_num_frozen: userAssets.fod_num_frozen + fodNum
    }, {
      transaction: t
    })
    Log.info(ctx.uuid, 'invest().userAssetUpdate', userAssetUpdate)
    if (!userAssetUpdate) {
      ret.code = 200004
      ret.message = '设置自己fod币失败'

      t.rollback()
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
      days : investData.days
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

}

module.exports = new UserService()