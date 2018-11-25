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
    }
  }

}