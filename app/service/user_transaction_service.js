const Log = require('./../../lib/log')('user_service')
const UserModel = require('./../model/user_model')
const UserAssetsModel = require('./../model/user_assets_model')
const errCode = require('./../common/err_code')
const Op = require('sequelize').Op

class UserTransactionService {

  /**
   * 交易列表
   * @param {*} ctx 
   */
  async list(ctx){
    let ret = {
      code: errCode.SUCCESS.code,
      message: errCode.SUCCESS.message
    }

    let body = ctx.body || {}
    Log.info(ctx.uuid, 'getUserInfoList().query', body)

    let userModel = UserModel().model()
    let userTransactionModel = UserModel().transactionModel()
    let userInfoModel = UserModel().infoModel()

    userTransactionModel.belongsTo(userModel , {targetKey: 'id' , foreignKey : 'user_id'})
    userTransactionModel.belongsTo(userInfoModel, {targetKey: 'user_id' , foreignKey : 'user_id'})

    let map = {}

    if(body.user_id){
      map.user_id = body.user_id
    }
    let offset = body.offset || 0
    let limit = body.limit || 10

    let queryRet = await userTransactionModel.findAndCountAll({
      where: map,
      include: [
        {
          model: userInfoModel,
          attributes: ['realname']
        },
        {
          model: userModel,
          attributes: ['mobile']
        }
      ],
      offset: offset,
      limit: limit
    })

    Log.info(ctx.uuid, 'getUserInfoList().queryRet', queryRet)
    ret.data = queryRet
    ctx.result = ret
    return ret

  }

  async apply(ctx){
    let ret = {
      code: errCode.SUCCESS.code,
      message: errCode.SUCCESS.message
    }

    let body = ctx.body || {}
    Log.info(ctx.uuid, 'getUserInfoList().body', body)
    let t = await UserModel().getTrans()

    let userTransaction = await UserModel().transactionModel().findOne({
      where: {uuid: body.uuid}
    })
    if(!userTransaction){
      ret.code = errCode.SUCCESS.code
      ret.message = '未找到相关条目'

      ctx.result = ret
      return ret
    }

    try {
      // TODO 是否要从接口更新资产

      userTransaction.status = 1
      let saveRet = await userTransaction.save({transaction: t})
      if(saveRet.id && userTransaction.type == 1){
        // 用户资产添加
        let userId = userTransaction.user_id
        let num = userTransaction.num_get
        let addAssetsRet = await UserAssetsModel().addFodNum(ctx , userId , num , t)
        if(addAssetsRet.code != 0){
          ret.code = addAssetsRet.code
          ret.message = addAssetsRet.message

          t.rollback()
          ctx.result = ret
          return ret
        }
      }
       
      // TODO 减少资产

      t.commit()
      ctx.result = ret
      return ret

    }catch(err){
      console.log(err)
      Log.info(ctx.uuid, 'getUserInfoList().err', err)
      t.rollback()

      ret.code = errCode.FAIL.code
      ret.message = '操作失败'

      ctx.result = ret
      return ret
    }
    
    
  }

  /**
   * 添加一笔交易
   * @param {*} ctx 
   */
  async add(ctx){
    let ret = {
      code: errCode.SUCCESS.code,
      message: errCode.SUCCESS.message
    }

    let body = ctx.body || {}
    Log.info(ctx.uuid, 'getUserInfoList().body', body)

    let userId = body.user_id
    let user = await UserModel().model().findById(userId)
    if(!user || user.status != 1){
      ret.code = errCode.FAIL.code
      ret.message = '未找到用户或用户未审核'

      ctx.result = ret
      return ret
    }

    let addData = {
      user_id : userId
    }
    let type = body.type || 1
    let num = body.num

    if(type == 1){
      addData.type = type
      addData.num_get = num
    }
    Log.info(ctx.uuid, 'getUserInfoList().addData', addData)

    let userTransaction = await UserModel().transactionModel().create(addData)
    Log.info(ctx.uuid, 'getUserInfoList().userTransaction', userTransaction.dataValues)
    
    ret.data = userTransaction.dataValues

    ctx.result = ret
    return ret
  }

  action(ctx){

  }

  /**
   * 完成
   * @param {*} ctx 
   */
  complete(ctx){

  }

  cancel(ctx){

  }
}

module.exports = new UserTransactionService