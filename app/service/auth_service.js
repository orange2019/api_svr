const Log = require('./../../lib/log')('auth_service')
const UserModel = require('./../model/user_model')
const errCode = require('./../common/err_code')
const uuid = require('uuid')
const Op = require('sequelize').Op

class AuthService {

     /**
     * 用户登陆
     */
    async login(ctx) {
      
      let ret = {
        code: errCode.SUCCESS.code,
        message: errCode.SUCCESS.message
      }
  
      let { mobile, password } = ctx.body
  
      let user = await UserModel().model().findOne({
        where: {
            mobile: mobile
        }
      })
      Log.info(`${ctx.uuid}|login().auth` , user , cryptoUtils.md5(password))
  
      if(!user || user.password.toUpperCase() != cryptoUtils.md5(password)){
        ret.code = errCode.ACCOUNT.loginFail.code;
        ret.message = errCode.ACCOUNT.loginFail.message;
      }else {
        //TODO 生成token
        // let token = await this._generateToken(user);
        ret.data = {
            token : ''
        };
      }
  
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
    var user = await UserModel().model().build({
      'mobile'     : mobile,
      'password'   : password,
      // 'fod_token'  : ctx.fod_token,
      // 'auth_token' : ctx.body.auth_token,
      'status' : 0,
      'pid'    : saveUser.pid || 0,
      'uuid'   : '',

    });
    user = await user.save();
    //TODO 生成token
    // let token = await this._generateToken(user);
    ret.data = {
        token : 'token'
    };

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