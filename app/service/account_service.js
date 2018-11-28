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
    async accountRegister()
    {

    }

    /**
     * 用户登陆
     */
    async accountLogin()
    {

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
        let userId = params.userId || 0 ;
        let password = params.password || null ;
        if( !password )
        {
            throw new Error('修改密码不能为空！');
        }
        let user = await UserModel().model().findById(userId);
        if (!user) {
            throw new Error('未找到对应用户！');
        }
        //保存密码
        user.password = password;
        await user.save();
        return true;
    }

    /**
     * 生成验证登录状态的token
     */
    async _generateToken(params)
    {

    }
}

module.exports = new Account_Service();