const Log = require('./../../lib/log')('user_service')
const UserModel = require('./../model/user_model')
const ContractTokenModel = require('./../model/contract_token_model')
const errCode = require('./../common/err_code')
const Op = require('sequelize').Op
const cryptoUtils = require('./../utils/crypto_utils')
const web3 = require('./../web3')
const config = require('./../../config/index')

class UserService {

  /**
   * 授权
   * @param {*} ctx 
   */
  async getByToken(ctx) {
    let ret = {
      code: errCode.SUCCESS.code,
      message: errCode.SUCCESS.message
    }

    let token = ctx.query.token || ''
    if (!token) {
      ret.code = -1
      ret.message = 'token err'

      ctx.result = ret
      return ret
    }

    let user = await UserModel().model().findOne({
      where: {
        [Op.or]: [{
            auth_token_1: token
          },
          {
            auth_token_2: token
          }
        ]
      }
    })

    if (!user) {
      ret.code = -100
      ret.message = 'auth err'

      ctx.result = ret
      return ret
    }

    ctx.body.user_id = user.id
    ctx.body.user_uuid = user.uuid
    ctx.body.user_status = user.status

    return ret
  }

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
    let userAssetsModel = UserModel().assetsModel()

    userModel.hasOne(userInfoModel, {
      foreignKey: 'user_id'
    })
    // userAssetsModel.belongsTo(userModel , {foreignKey : 'id'})
    userModel.hasOne(userAssetsModel, {
      foreignKey: 'user_id'
    })

    let data = await userModel.findAndCountAll({
      where: map,
      include: [{
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

  async logout(ctx) {

    let ret = {
      code: errCode.SUCCESS.code,
      message: errCode.SUCCESS.message
    }

    Log.info(`${ctx.uuid}|logout().body`, ctx.body)
    let userId = ctx.body.user_id
    let type = ctx.body.type || 1

    let user = await UserModel().model().findById(userId)
    if (type == 1) {
      user.auth_token_1 = ''
    } else if (type == 2) {
      user.auth_token_2 = ''
    }

    let retSave = await user.save()
    Log.info(`${ctx.uuid}|logout().retSave`, retSave)

    ctx.result = ret
    return ret
  }
  /**
   * 用户信息
   * @param {*} ctx 
   */
  async info(ctx) {
    let ret = {
      code: errCode.SUCCESS.code,
      message: errCode.SUCCESS.message
    }

    Log.info(`${ctx.uuid}|info().body`, ctx.body)
    let userId = ctx.body.user_id

    let userModel = UserModel().model()
    let userInfoModel = UserModel().infoModel()

    userModel.hasOne(userInfoModel, {
      foreignKey: 'user_id'
    })

    let user = await userModel.findOne({
      where: {
        id: userId
      },
      include: [{
          model: userInfoModel
        }

      ],
      attributes: ['id', 'uuid', 'mobile', 'wallet_address', 'status']
    })

    Log.info(`${ctx.uuid}|info().user`, user)

    if (!user) {
      ret.code = errCode.FAIL.code
      ret.message = '未找到用户'
    }

    ret.data = {
      user: user,
      invite_url: config.domain.h5 + '/invite?token=' + user.token
    }

    ctx.result = ret
    return ret
  }

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

    let userBalance = await web3.getBalance(accountAddress)
    let userTokenBalance = await web3.getTokenBalance(contractAddress, accountAddress)

    let data = user.dataValues
    data.balance = userBalance
    data.token_balance = userTokenBalance

    ret.data = data

    ctx.result = ret
    return ret
  }

  /**
   * 更新
   * @param {*} ctx 
   */
  async infoUpdate(ctx) {
    let ret = {
      code: errCode.SUCCESS.code,
      message: errCode.SUCCESS.message
    }

    let body = ctx.body
    Log.info(`${ctx.uuid}|infoUpdate().body`, ctx.body)
    let userId = ctx.body.user_id || 0

    let userInfo = await UserModel().infoModel().findOne({
      where: {
        user_id: userId
      }
    })

    Log.info(`${ctx.uuid}|infoUpdate().userInfo`, ctx.userInfo)
    if (!userInfo) {
      let userData = {
        realname: body.realname || '',
        sex: body.sex || 0,
        idcard_no: body.idcard_no || '',
        idcard_positive: body.idcard_positive || '',
        idcard_reverse: body.idcard_positive || '',
        user_id: userId
      }

      let retUpdate = await UserModel().infoModel().create(userData)

      if (!retUpdate) {
        ret.code = errCode.FAIL.code
        ret.message = '更新失败'

        ctx.result = ret
        return ret
      }
    } else {
      userInfo.realname = body.realname || ''
      userInfo.sex = body.sex || 0
      userInfo.idcard_no = body.idcard_no || ''
      userInfo.idcard_positive = body.idcard_positive || ''
      userInfo.idcard_reverse = body.idcard_positive || ''

      let retUpdate = await userInfo.save()
      if (!retUpdate) {
        ret.code = errCode.FAIL.code
        ret.message = '更新失败'

        ctx.result = ret
        return ret
      }
    }

    return ret
  }

  async infoUpdateAvatar(ctx) {
    let ret = {
      code: errCode.SUCCESS.code,
      message: errCode.SUCCESS.message
    }

    let body = ctx.body
    Log.info(`${ctx.uuid}|infoUpdate().body`, ctx.body)
    let userId = ctx.body.user_id || 0

    let userInfo = await UserModel().infoModel().findOne({
      where: {
        user_id: userId
      }
    })

    Log.info(`${ctx.uuid}|infoUpdate().userInfo`, ctx.userInfo)
    if (!userInfo) {
      let userData = {
        avatar: body.avatar,
        user_id: userId
      }

      let retUpdate = await UserModel().infoModel().create(userData)

      if (!retUpdate) {
        ret.code = errCode.FAIL.code
        ret.message = '更新失败'

        ctx.result = ret
        return ret
      }
    } else {
      userInfo.avatar = body.avatar

      let retUpdate = await userInfo.save()
      if (!retUpdate) {
        ret.code = errCode.FAIL.code
        ret.message = '更新失败'

        ctx.result = ret
        return ret
      }
    }

    ret.data = {
      avatar: body.avatar
    }
    ctx.result = ret
    return ret
  }

  async inviteInfo(ctx) {
    let ret = {
      code: errCode.SUCCESS.code,
      message: errCode.SUCCESS.message
    }

    Log.info(ctx.uuid, 'inviteInfo().body', ctx.body)

    let userId = ctx.body.user_id

    // let user = await UserModel().model().findById(userId)
    let userInfo = await UserModel().getUserInfoByUserId(userId)

    ret.data = {}
    // ret.data.invite_code = user.invite_code
    ret.data.user_name = userInfo.realname
    ret.data.qrcode_url = config.domain.h5 + '/invite/download'
    ret.data.avatar = userInfo.avatar
    // ret.data.avatar = 'http://i10.hoopchina.com.cn/hupuapp/bbs/966/16313966/thread_16313966_20180726164538_s_65949_o_w1024_h1024_62044.jpg?x-oss-process=image/resize,w_800/format,jpg'
    // ret.data.down_url = config.domain.oss + '/uploads/download/wallet-app-release.apk'

    ctx.result = ret
    return ret
  }

  /**
   * 邀请列表
   */
  async inviteList(ctx) {
    let ret = {
      code: errCode.SUCCESS.code,
      message: errCode.SUCCESS.message
    }

    Log.info(ctx.uuid, 'inviteList().body', ctx.body)

    let userId = ctx.body.user_id

    let map = {}
    map.pid = userId
    map.status = 1

    Log.info(ctx.uuid, 'inviteList().where', map)

    let userModel = UserModel().model()
    let userInfoModel = UserModel().infoModel()

    userModel.hasOne(userInfoModel, {
      foreignKey: 'user_id'
    })

    let data = await userModel.findAndCountAll({
      where: map,
      include: [{
        model: userInfoModel,
        attributes: ['realname', 'avatar']
      }],
      order: [
        ['create_time', 'DESC']
      ],
      attributes: ['id', 'uuid', 'mobile', 'status', 'create_time']
    })

    ret.data = data
    Log.info(ctx.uuid, 'inviteList().ret', ret)
    ctx.result = ret
    return ret
  }

  /**
   * 更改密码
   * @param {*} ctx 
   */
  async changePwd(ctx) {
    let ret = {
      code: errCode.SUCCESS.code,
      message: errCode.SUCCESS.message
    }

    let userId = ctx.body.user_id
    let {
      password,
      password_again
    } = ctx.body
    if (password !== password_again) {
      ret.code = errCode.FAIL.code
      ret.message = '两次密码输入不一致'

      ctx.result = ret
      return ret
    }
    let user = await UserModel().model().findById(userId)

    user.password = cryptoUtils.md5(password)
    await user.save()

    ctx.result = ret
    return ret
  }

  /**
   * 地址列表
   * @param {*} ctx 
   */
  async addressList(ctx) {
    let ret = {
      code: errCode.SUCCESS.code,
      message: errCode.SUCCESS.message
    }
    let userId = ctx.body.user_id
    Log.info(`${ctx.uuid}|addressList() body:`, ctx.body)
    let userInfo = await UserModel().infoModel()
      .findOne({
        where: {
          user_id: userId
        }
      })
    let addressList = userInfo.address
    ret.data = addressList
    Log.info(`${ctx.uuid}|addressList().ret`, ret)
    ctx.result = ret
    return ret
  }

  /**
   * 更新地址
   * @param {*} ctx 
   */
  async addressUpdate(ctx) {
    let ret = {
      code: errCode.SUCCESS.code,
      message: errCode.SUCCESS.message
    }
    let userId = ctx.body.user_id
    Log.info(`${ctx.uuid}|addressList() body:`, ctx.body)
    let userInfo = await UserModel().getUserInfoByUserId(userId)

    userInfo.address = ctx.body.address;
    let retUpdate = await userInfo.save()
    if (!retUpdate) {
      ret.code = errCode.FAIL.code
      ret.message = '更新失败'
    }
    ctx.result = ret
    return ret
  }
}

module.exports = new UserService()