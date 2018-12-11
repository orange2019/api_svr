const Log = require('./../../lib/log')('auth_service')
const UserModel = require('./../model/user_model')
const errCode = require('./../common/err_code')
const uuid = require('uuid')
const Op = require('sequelize').Op
const cryptoUtils = require('./../utils/crypto_utils')
const smsUtils = require('./../utils/sms_utils')
const Web3 = require('./../web3/index')

class AuthService {
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
    let from = ctx.body.from || 1
    let token = uuid.v4()
    if (from == 1) {
      user.auth_token_1 = token
    } else {
      user.auth_token_1 = token
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
      return ret
    }

    // 验证手机号码
    let checkCodeRst = smsUtils.validateCode(mobile, verify_code)
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
    Log.info(`${ctx.uuid}|register().user`, user)

    if (user) {
      ret.code = errCode.FAIL.code
      ret.message = '请不要重复注册'
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

    user = await UserModel().model().create({
      mobile: mobile,
      password: cryptoUtils.md5(password),
      status: 0,
      pid: pid,
      wallet_address: address || '',
      private_key: privateKey || ''
    })

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
    let checkCodeRst = smsUtils.validateCode(mobile, verify_code)
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

}

module.exports = new AuthService()