const Log = require('./../../lib/log')('user_service')
const UserModel = require('./../model/user_model')
const UserAssetsModel = require('./../model/user_assets_model')
const errCode = require('./../common/err_code')
const Op = require('sequelize').Op

class UserService {

  /**
   * 获取用户列表，关联查询
   * @param {*} ctx 
   * @param {*} where 
   * @param {*} offset 
   * @param {*} limit 
   */
  async getUserInfoList(ctx, where = {}, offset = 0, limit = 10) {
    let ret = {
      code: errCode.SUCCESS.code,
      message: errCode.SUCCESS.message
    }

    Log.info(ctx.uuid, 'getUserInfoList().body', ctx.body)

    where = ctx.body.where || {}
    offset = ctx.body.offset || 0
    limit = ctx.body.limit || 10

    let map = {}
    if (where.keyword) {
      map.mobile = {
        [Op.like]: `%${where.keyword}%`
      }
    }

    Log.info(ctx.uuid, 'getUserInfoList().where', where, 'offset|limit', offset, limit)

    let userModel = UserModel().model()
    let userInfoModel = UserModel().infoModel()
    let userAssetsModel = UserAssetsModel().model()

    userModel.hasOne(userInfoModel, {
      foreignKey: 'user_id'
    })
    // userAssetsModel.belongsTo(userModel , {foreignKey : 'id'})
    userModel.hasOne(userAssetsModel, {
      foreignKey: 'user_id'
    })

    let data = await userModel.findAndCountAll({
      where: map,
      include: [
        {
          model: userInfoModel
        },
        {
          model: userAssetsModel
        }
      ],
      offset: offset,
      limit: limit
    })
    Log.info(ctx.uuid, 'getUserInfoList().ret', ret)
    ret.data = data
    ctx.result = ret
    return ret

  }

  /**
   * 修改状态
   * @param {*} ctx 
   */
  async status(ctx) {
    let ret = {
      code: errCode.SUCCESS.code,
      message: errCode.SUCCESS.message
    }

    Log.info(`${ctx.uuid}|status().body`, ctx.body)
    let userId = ctx.body.user_id || 0
    let status = ctx.body.status || 0

    if (!userId) {
      ret.code = errCode.ADMIN.userFindError.code
      ret.message = errCode.ADMIN.userFindError.message

      ctx.result = ret
      return ret
    }

    let user = await UserModel().model().findById(userId)
    Log.info(`${ctx.uuid}|status().news`, user)
    if (!user) {
      ret.code = errCode.ADMIN.userFindError.code
      ret.message = errCode.ADMIN.userFindError.message

      ctx.result = ret
      return ret
    }

    user.status = status
    await user.save()

    ctx.result = ret
    Log.info(`${ctx.uuid}|status().ret`, ret)
    return ret

  }

}

module.exports = new UserService()