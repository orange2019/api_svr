const Log = require('./../../lib/log')('auth_service')
const UserModel = require('./../model/user_model')
const errCode = require('./../common/err_code')
const uuid = require('uuid')
const Op = require('sequelize').Op
const cryptoUtils = require('./../utils/crypto_utils')
const smsUtils = require('./../utils/sms_utils')
const Web3 = require('./../web3/index')
const StrUtils = require('./../utils/str_utils')

class AuthService {

  async sendSmsCode(ctx) {
    let ret = {
      code: errCode.SUCCESS.code,
      message: errCode.SUCCESS.message
    }

    let {
      mobile
    } = ctx.body

    if (!mobile) {
      ret.code = errCode.SMS.mobileNotFound.code
      ret.message = errCode.SMS.mobileNotFound.message

      ctx.result = ret
      return ret
    }
    let sendStatus = await smsUtils.sendSmsCode(mobile)
    if (sendStatus === false) {
      ret.code = errCode.SMS.sendError.code
      ret.message = errCode.SMS.sendError.message
    }

    ctx.result = ret
    return ret
  }

  async sendSmsCodeAuth(ctx) {
    let ret = {
      code: errCode.SUCCESS.code,
      message: errCode.SUCCESS.message
    }

    let userId = ctx.body.user_id
    let user = await UserModel().model().findById(userId)
    let mobile = user.mobile

    if (!mobile) {
      ret.code = errCode.SMS.mobileNotFound.code
      ret.message = errCode.SMS.mobileNotFound.message

      ctx.result = ret
      return ret
    }
    let sendStatus = await smsUtils.sendSmsCode(mobile)
    if (sendStatus === false) {
      ret.code = errCode.SMS.sendError.code
      ret.message = errCode.SMS.sendError.message
    }

    ctx.result = ret
    return ret
  }

  async sendSmsCodeAuthCheck(ctx) {
    let ret = {
      code: errCode.SUCCESS.code,
      message: errCode.SUCCESS.message
    }

    let userId = ctx.body.user_id
    let {
      verify_code
    } = ctx.body

    let user = await UserModel().model().findById(userId)

    // 验证手机号码
    let checkCodeRst = await smsUtils.validateCode(user.mobile, verify_code)
    Log.info(`${ctx.uuid}|sendSmsCodeAuthCheck().checkCodeRst`, checkCodeRst)
    if (checkCodeRst.code !== 0) {
      ret.code = checkCodeRst.code
      ret.message = checkCodeRst.message
      ctx.result = ret
      return ret
    }

    ctx.result = ret
    return ret
  }

  /**
   * 用户登陆
   */
  async login(ctx) {
    let ret = {
      code: errCode.SUCCESS.code,
      message: errCode.SUCCESS.message
    }

    let {
      mobile,
      password
    } = ctx.body

    let user = await UserModel().model().findOne({
      where: {
        mobile: mobile
      }
    })
    Log.info(`${ctx.uuid}|login().auth`, user, cryptoUtils.md5(password))

    if (!user || user.password.toUpperCase() != cryptoUtils.md5(password)) {
      ret.code = errCode.ACCOUNT.loginFail.code
      ret.message = errCode.ACCOUNT.loginFail.message

      ctx.result = ret
      return ret
    }

    // 生成token
    let type = ctx.query.type || 0
    let token = uuid.v4()
    if (type == 0) {
      user.auth_token_1 = token
    } else {
      user.auth_token_2 = token
    }

    await user.save()
    ret.data = {
      token: token
    }

    Log.info(`${ctx.uuid}|login().ret`, ret)
    ctx.result = ret
    return ret
  }

  /**
   * 注册
   * @param {*} ctx
   */
  async register(ctx) {
    let ret = {
      code: errCode.SUCCESS.code,
      message: errCode.SUCCESS.message
    }

    let {
      mobile,
      password,
      verify_code,
      invite_code
    } = ctx.body
    Log.info(`${ctx.uuid}|register().body`, ctx.body)
    if (!mobile || !password || mobile.length != 11) {
      ret.code = errCode.FAIL.code
      ret.message = '注册失败，提交数据有误'
      ctx.result = ret
      return ret
    }

    // 验证手机号码
    let checkCodeRst = await smsUtils.validateCode(mobile, verify_code)
    Log.info(`${ctx.uuid}|register().checkCodeRst`, checkCodeRst)
    if (checkCodeRst.code !== 0) {
      ret.code = checkCodeRst.code
      ret.message = checkCodeRst.message
      ctx.result = ret
      return ret
    }

    let user = await UserModel().model().findOne({
      where: {
        mobile: mobile
      }
    })
    Log.info(`${ctx.uuid}|register().user`, user)

    if (user) {
      ret.code = errCode.FAIL.code
      ret.message = '您已注册，可直接前往登录'
      ctx.result = ret
      return ret
    }

    let pid = 0
    // 检测邀请码
    if (invite_code) {
      let inviteUser = await UserModel().model().findOne({
        where: {
          [Op.or]: [{
              invite_code: invite_code
            },
            {
              mobile: invite_code
            }
          ]
        }
      })
      if (!inviteUser) {
        ret.code = errCode.FAIL.code
        ret.message = '无效邀请码'
        ctx.result = ret
        return ret
      } else {
        pid = inviteUser.id
      }
    }

    let {
      address,
      privateKey
    } = await Web3.accountRegister()
    Log.info(`${ctx.uuid}|register().address`, address, privateKey)
    let addressReserve = StrUtils.transWalletAddress(address)

    user = await UserModel().model().create({
      mobile: mobile,
      password: cryptoUtils.md5(password),
      status: 0,
      pid: pid,
      wallet_address: address || '',
      reserve_address: addressReserve,
      private_key: privateKey || ''
    })

    // 加上userInfo
    let userId = user.id
    UserModel().getUserInfoByUserId(userId)

    ret.data = {
      uuid: user.uuid
    }
    Log.info(`${ctx.uuid}|register().ret`, ret)
    ctx.result = ret
    return ret
  }

  /**
   * 忘记密码
   */
  async forgetPassword(ctx) {
    let ret = {
      code: errCode.SUCCESS.code,
      message: errCode.SUCCESS.message
    }

    let {
      mobile,
      password,
      verify_code
    } = ctx.body

    // 验证手机短信
    let checkCodeRst = await smsUtils.validateCode(mobile, verify_code)
    if (checkCodeRst.code !== 0) {
      ret.code = checkCodeRst.code
      ret.message = checkCodeRst.message
      return ret
    }

    let user = await UserModel().model().findOne({
      where: {
        mobile: mobile
      }
    })

    if (!user) {
      ret.code = errCode.FAIL.code
      ret.message = '无效用户'

      return ret
    }

    user.password = cryptoUtils.md5(password)
    let saveRet = await user.save()
    if (!saveRet) {
      ret.code = errCode.FAIL.code
      ret.message = '重置密码失败'
    }

    return ret
  }

  async resetMobile(ctx) {
    let ret = {
      code: errCode.SUCCESS.code,
      message: errCode.SUCCESS.message
    }

    let {
      mobile,
      password,
      verify_code,
      mobile_new
    } = ctx.body

    // 验证手机短信
    let checkCodeRst = await smsUtils.validateCode(mobile_new, verify_code)
    Log.info(`${ctx.uuid}|resetMobile().checkCodeRst`, checkCodeRst)
    if (checkCodeRst.code !== 0) {
      ret.code = checkCodeRst.code
      ret.message = checkCodeRst.message
      ctx.result = ret
      return ret
    }

    let user = await UserModel().model().findOne({
      where: {
        mobile: mobile
      }
    })
    Log.info(`${ctx.uuid}|resetMobile().user`, user)
    if (!user) {
      ret.code = errCode.FAIL.code
      ret.message = '无效用户'
      ctx.result = ret
      return ret
    }

    if (user.password != cryptoUtils.md5(password)) {
      ret.code = errCode.FAIL.code
      ret.message = '密码错误'
      ctx.result = ret
      return ret
    }

    user.mobile = mobile_new
    let saveRet = await user.save()
    if (!saveRet) {
      ret.code = errCode.FAIL.code
      ret.message = '重置手机号失败'
    }
    ctx.result = ret
    return ret

  }

}

module.exports = new AuthService()