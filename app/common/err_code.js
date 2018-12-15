module.exports = {
  SUCCESS: {
    code: 0,
    message: 'SUCCESS',
    data : {}
  },
  FAIL: {
    code: 1,
    message: 'FAIL',
    data : {}
  },
  
  ADMIN: {
    authFail : {
      code : -100,
      message: '请重新登录'
    },
    newsFindError: {
      code : 100001,
      message: '未找到对应资讯条目'
    },
    newsUpdateError: {
      code : 100002,
      message: '更新资讯失败'
    },
    userFindError: {
      code : 100101,
      message: '未找到对应用户'
    }
  },

  ACCOUNT: {
    accountNotFound : {
      code    : 40001,
      message : '未找到对应用户' 
    },
    passwordNotNull : {
      code    : 40002,
      message : '修改密码不能为空' 
    },
    loginFail : {
      code    : 40003,
      message : '登陆失败'
    }
  },

  ORDER: {
    amountNotEnough : {
      code : 4000,
      message : '总积分不足'
    },
    orderPayDone : {
      code : 40001,
      message : '已付款订单不可取消'
    },
    orderNotFound : {
      code : 4004,
      message : '订单不存在'
    }
  },

  SMS: {
    codeError: {
      code: 4000,
      message: '验证码错误'
    },
    sendError: {
      code: 4001,
      message: '验证码发送错误,请重试'
    },
    codeExpired: {
      code: 4003,
      message: '验证码过期'
    },
    mobileNotFound: {
      code: 4004,
      message: '请输入手机号'
    }
  }

}