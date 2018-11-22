module.exports = {
  SUCCESS : {
    code : 0,
    message : 'success',
    data : {}
  },
  FAIL : {
    code : 1,
    message : 'error'
  },

  VERIFY_CHECK_ERROR : {
    code : 1001,
    message : '验证码错误'
  },
  
  USER_EMAIL_REQUIRED : {
    code : 8001,
    message : '用户邮箱存在'
  },
  USER_NAME_REQUIRED : {
    code : 8002,
    message : '用户名重复'
  },
  USER_FIND_ERROR : {
    code : 8010,
    message : '用户未找到'
  },
  USER_AUTH_INFO_UPDATE_FAIL : {
    code : 8011,
    message :'用户认证信息更新失败'
  },

  ORDER_FIND_ERROR : {
    code : 9001,
    message :'订单未找到'
  },
  ORDER_COMPLETE_FAIL : {
    code : 9002,
    message : '订单完成失败'
  },

  PAY_CONFIG_FIND_ERR : {
    code : 9011,
    message : '支付配置错误'
  }
  
  
}