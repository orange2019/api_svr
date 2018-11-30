/**
 * @file 账号数据服务层文件
 */
'use strict';
const Log = require('../../lib/log')('account_service');
const BaseModel = require('../model/base_model');
const UserModel = require('../model/user_model');
const UserAssetsModel = require('../model/user_assets_model');
const UuidUtils = require('../utils/uuid_utils');
const dateUtils = require('../utils/date_utils');
const errCode = require('../common/err_code');

class Account_Service {

    /**
     * 用户注册
     */
    async accountRegister(ctx)
    {
        let ret = {
            code : errCode.SUCCESS.code,
            message : errCode.SUCCESS.message
        };
        var user = await UserModel().model().build({
            'mobile'     : ctx.mobile,
            'password'   : ctx.password,
            'fod_token'  : ctx.fod_token,
            'auth_token' : ctx.auth_token,
            'status' : 0,
            'pid'    : ctx.pid || 0,
            'uuid'   : '',

        });
        user = await user.save();
        //TODO 生成token
        let token = await this._generateToken(user);
        ret.data = {
            token : token
        };
  
        ctx.result = ret
        return ret
    }

    /**
     * 用户登陆
     */
    async accountLogin(ctx)
    {
        let ret = {
            code : errCode.SUCCESS.code,
            message : errCode.SUCCESS.message
          }
          let { mobile, password } = ctx.body
      
          let user = await UserModel().model().findOne({
            where: {
                mobile: mobile
            }
          })
          Log.info(`${ctx.uuid}|login().admin` , user , cryptoUtils.md5(password))
      
          if(!user || user.password.toUpperCase() != cryptoUtils.md5(password)){
            ret.code = errCode.ACCOUNT.loginFail.code;
            ret.message = errCode.ACCOUNT.loginFail.message;
          }else {
            //TODO 生成token
            let token = await this._generateToken(user);
            ret.data = {
                token : token
            };
          }
      
          ctx.result = ret
          return ret
    }

    /**
     * 用户信息
     */
    async accountInfo(userId)
    {
        let userModel = UserModel().model();
        let userInfoModel = UserModel().infoModel();
        userModel.hasOne(userInfoModel, {
            foreignKey: 'user_id'
        });
        let data = await userModel.findOne({
            where: {id:userId},
            include: [
              {
                model: userInfoModel
              }
            ]
          })
        //   console.log(data);
        return data;
    }

    /**
     * 修改用户信息
     * @param {Object} params 
     */
    async accountInfoUpdate(params){
        let ret = {
            code: errCode.SUCCESS.code,
            message: errCode.SUCCESS.message
        };

        let userId = params.userId || '';
        let user = await this.accountInfo(userId);

        if(!user){
            ret.code = errCode.ACCOUNT.accountNotFound.code;
            ret.message = errCode.ACCOUNT.accountNotFound.message;
            // ctx.result = ret
            return ret;
        }
        user.nickname = params.nickname || user.nickname;
        user.birth = params.birth || user.birth;
        await user.save();
        return ret;
    }

    async accountChangePassword()
    {
        //TODO: 校验验证码完成后，再执行修改密码
        let params = {
            userId : '',
            password : ''
        };
        let result = await this._changePassword(params);
    }
    
    /**
     * 用户修改密码
     * @param {Object} params 
     * 
     */
    async _changePassword(params)
    {
        Log.info(`_changePassword | ${params}`);
        console.log(params);
        let ret = {
            code: errCode.SUCCESS.code,
            message: errCode.SUCCESS.message
          }
        let userId = params.userId || 0 ;
        let password = params.password || null ;
        if( !password )
        {
            ret.code = errCode.ACCOUNT.accountNotFound.code;
            ret.message = errCode.ACCOUNT.accountNotFound.message;
            // ctx.result = ret
            return ret;
        }
        let user = await UserModel().model().findById(userId);
        if (!user) {
            ret.code = errCode.ACCOUNT.passwordNotNull.code;
            ret.message = errCode.ACCOUNT.passwordNotNull.message;
            // ctx.result = ret
            return ret;
        }
        //保存密码
        user.password = password;
        await user.save();
        // ctx.result = ret
        return ret;
    }

    /**
     * 生成验证登录状态的token
     */
    async _generateToken(params)
    {

    }
}

module.exports = new Account_Service();