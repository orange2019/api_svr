const Log = require('./../../lib/log')('auth_service')
const UserModel = require('./../model/user_model')
const errCode = require('./../common/err_code')
const uuid = require('uuid')
const Op = require('sequelize').Op

class AuthService {

  async login(ctx) {
    let ret = {
      code: errCode.SUCCESS.code,
      message: errCode.SUCCESS.message
    }

    let {
      mobile,
      password
    } = ctx.body

    //找到用户
    let user = await UserModel().model().findOne({
      where: {
        mobile: mobile
      }
    })

    // 先去接口登录 TODO, 
    let retApi = {
      code: 0,
      message: '',
      data: {
        cookie: {id:'1234'}
      }
    }
    if (retApi.code !== 0) {
      return retApi
    }
    let cookie = retApi.data.cookie

    // 从接口获取信息 TODO
    let userInfoApiRet = {
      code: 0,
      message: '接口获取信息失败',
      data: {
        token: '12345678-12345678'
      }
    }

    if (userInfoApiRet.code !== 0) {
      return userInfoApiRet
    }

    // 保存信息 
    let authToken = uuid.v4()

    if (user) {
      user.auth_token = authToken
      user.cookie = cookie
      await user.save()
      ret.data = {
        token: authToken
      }
      return ret
    }

    // 保存到数据库
    let retSave = await UserModel().model().create({
      mobile: mobile,
      // password: password,
      auth_token: authToken,
      fod_token: userInfoApiRet.data.token,
      is_self: 0,
      cookie:cookie
    })

    if (retSave) {
      ret.data = {
        token: authToken
      }
      return ret
    } else {
      ret.code = errCode.FAIL.code
      ret.message = '登录失败'
      return ret
    }
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
      vr,
      invite_code
    } = ctx.body
    let user = await UserModel().model().findOne({
      where: {mobile : mobile}
    })
    if(user){
      ret.code = errCode.FAIL.code
      ret.message = '请不要重复注册'
      return ret
    }

    let saveUser = {}
    // 检测邀请码
    if (invite_code) {
      let inviteUser = await UserModel().model().findOne({
        where: {
          invite_code: invite_code
        }
      })
      if (!inviteUser) {
        ret.code = errCode.FAIL.code
        ret.message = '无效邀请码'
        return ret
      } else {
        saveUser.pid = inviteUser.user_id
      }
    } else {
      saveUser.pid = 0
    }


    // 先去接口注册 TODO
    let retApi = {
      code: 0,
      message: '',
      data : {
        token : 'test-123435'
      }
    }
    if (retApi.code !== 0) {
      return retApi
    }

    // 接口注册成功
    saveUser.mobile = mobile
    // saveUser.password = password
    saveUser.is_self = 1
    saveUser.fod_token = retApi.data.token

    let saveRet = await UserModel().model().create(saveUser)
    if (!saveRet) {
      ret.code = errCode.FAIL.code
      ret.message = '注册失败'
      return ret
    } else {
      return ret
    }

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
      vr
    } = ctx.body

    let user = await UserModel().model().findOne({
      where: {
        mobile: mobile
      }
    })

    // 是否需要判断用户 TODO
    if(!user){
      ret.code = errCode.FAIL.code
      ret.message = '无效用户'

      return ret
    }

    // 去接口更新
    let retApi = {
      code: 0,
      message: ''
    }

    if (retApi.code != 0) {
      return retApi
    }

    // user.password = password
    // let saveRet = await user.save()
    // if (!saveRet) {
    //   ret.code = errCode.FAIL.code
    //   ret.message = '重置密码失败'
    // }

    return ret
  }


}

module.exports = new AuthService