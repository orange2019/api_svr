const Log = require('./../../lib/log')('admin_service')
const adminModel = require('./../model/admin_model')
const errCode = require('./../common/err_code')
const cryptoUtils = require('./../utils/crypto_utils')

class AdminService {

  /**
   * 管理员登录
   * @param {*} ctx 
   */
  async login(ctx) {

    let ret = {
      code: errCode.SUCCESS.code,
      message: errCode.SUCCESS.message
    }
    let {
      email,
      password,
      captcha
    } = ctx.body
    if (captcha != ctx.session.captcha) {
      ret.code = errCode.FAIL.code
      ret.message = '验证码错误'

      ctx.result = ret
      return ret
    }
    let admin = await adminModel().model().findOne({
      where: {
        email: email
      }
    })
    Log.info(`${ctx.uuid}|login().admin`, admin, cryptoUtils.md5(password))

    if (!admin || admin.password.toUpperCase() != cryptoUtils.md5(password)) {
      ret.code = errCode.FAIL.code
      ret.message = '登录失败'
      // return ret
    } else {
      ctx.session.admin = {
        id: admin.id,
        email: admin.email,
        type: admin.type
      }

    }

    ctx.result = ret
    return ret

  }

  /**
   * 检查登录状态
   * @param {*} ctx 
   */
  async check(ctx) {
    let ret = {
      code: errCode.SUCCESS.code,
      message: errCode.SUCCESS.message
    }

    let session = ctx.session
    let admin = session.admin || null
    if (!admin || !admin.id) {
      ret.code = errCode.ADMIN.authFail.code
      ret.message = errCode.ADMIN.authFail.message
    } else {
      ret.data = admin
    }

    ctx.result = ret
    return ret
  }

  async update(ctx) {
    let ret = {
      code: errCode.SUCCESS.code,
      message: errCode.SUCCESS.message
    }

    let {
      password_old,
      password,
      password_again
    } = ctx.body

    let session = ctx.session
    let admin = session.admin || null
    if (!admin || !admin.id) {
      ret.code = errCode.ADMIN.authFail.code
      ret.message = errCode.ADMIN.authFail.message

      ctx.result = ret
      return ret
    }
    if (password != password_again) {
      ret.code = errCode.ADMIN.authFail.code
      ret.message = '两次输入密码不一致'

      ctx.result = ret
      return ret
    }

    let adminInfo = await adminModel().model().findById(admin.id)
    if (adminInfo.password.toUpperCase() != cryptoUtils.md5(password_old)) {
      ret.code = errCode.ADMIN.authFail.code
      ret.message = '旧密码错误'

      ctx.result = ret
      return ret
    }

    adminInfo.password = cryptoUtils.md5(password)
    await adminInfo.save()
    ctx.result = ret
    return ret


  }

  async logout(ctx) {
    let ret = {
      code: errCode.SUCCESS.code,
      message: errCode.SUCCESS.message
    }

    ctx.session.admin = null
    ctx.result = ret
    return ret
  }
}

module.exports = new AdminService