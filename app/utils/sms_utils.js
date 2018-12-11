/**
 * @file 短信发送工具
 */
'use strict';
const request = require('superagent')
const xml2js = require('xml2js')
const parser = new xml2js.Parser();
const Log = require('./../../lib/log')('sms_utils')
const MobileCodeModel = require('./../model/mobile_code_model')
const errCode = require('./../common/err_code')

class SmsUtils
{
    
    constructor()
    {
        /**
         * 短信协议: HTTP
        服务器地址: 103.24.176.16
        服务器监听端口号: 8138
        用户名: GKXM01
        密码: 3j77rbqE
        客户端IP: %
        服务号码: 0072
        最大连接数: 6
        发送速度: 300条/秒
        */
        this.config = {
            sms_uri : 'http://103.24.176.16:8138/14.dox',
            username : 'GKXM01',
            password : '3j77rbqE',
            Caller : '0072',
            DCS : 8,
            codeExpiredTime : 600,//过期时间，十分钟，以秒为单位
        }
    }

    /**
     * 发送短信
     * @param {int} mobile 
     * @param {string} message 
     * @returns {boolean}
     */
    async sendSms(mobile,message){
        //默认返回错误
        let returnResult = false
        try{
            let result = await request
            .get(this.config.sms_uri)
            .query({
                'UserName' : this.config.username,
                'PassWord' : this.config.password,
                'DCS' : this.config.DCS,
                'Caller' : this.config.Caller,
                'Callee' : '86'+mobile,
                'Text' : message
            })
            //解析XML
            parser.parseString(result.text, (err, result) => {
                Log.info('sendSms() result:',result.Message);
                //状态成功才返回true
                if(result.Message.Head[0].Status[0]==='0')
                {
                    returnResult = true
                }
            });
        }catch(error){
            Log.error('sendSms() error:',error);
        }
        return returnResult
        
    }


    /**
     * 发送短信验证码
     * @param {string} mobile 
     */
    async sendSmsCode(mobile)
    {   
        let code = await this._generateValidateCode(mobile)
        let msgTpl = `【卡西慕】验证码:${code} (十分钟内有效)`
        return await this.sendSms(mobile,msgTpl)
        
    }

    /**
     * 发送验证码
     * @param {*} mobile 
     */
    async _generateValidateCode(mobile)
    {
        let code =  Math.random().toString().substr(2,4);
        let info = {
            mobile: mobile,
            code: code
        }
        let insertResult = await MobileCodeModel().model().create(info)
        //插入不成功
        if (!insertResult) {
            return false;
        }
        //插入成功
        Log.info('_generateValidateCode mobile:',mobile,'code:',code)
        return code;
    }

    /**
     * 验证验证码
     * @param {string} mobile 
     * @param {int} code 
     */
    async validateCode(mobile,code)
    {
        Log.info('validateCode mobile:',mobile,'code:',code)
            let requestTime = parseInt(Date.now() / 1000)
            let ret = {
                code: errCode.SUCCESS.code,
                message: errCode.SUCCESS.message
            }
        try{
            let codeInfo = await MobileCodeModel().model().findOne({
                where:{
                    mobile:mobile,
                    code:code
                }
            });

            //无记录则视为错误
            if( !codeInfo )
            {
                ret.code = errCode.SMS.codeError.code
                ret.message = errCode.SMS.codeError.message
                return ret;
            }

            //校验时效 以及 验证码状态
            if ( requestTime - codeInfo.create_time > this.config.codeExpiredTime || codeInfo.status == 1) {
                ret.code = errCode.SMS.codeExpired.code
                ret.message = errCode.SMS.codeExpired.message
                return ret;
            }

            //更改状态
            codeInfo.status = 1
            codeInfo.update_time = requestTime
            await codeInfo.save();
            return ret;
        }catch(err){
            Log.error('validateCode err:',err)
            ret.code = errCode.SMS.codeError.code
            ret.message = errCode.SMS.codeError.message
            return ret;
        }
        
    }

}



module.exports = new SmsUtils()