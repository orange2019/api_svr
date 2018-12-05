const fs = require('fs')
const path = require('path')

let config = {

  db: {
    host: '59939c0a9a983.gz.cdb.myqcloud.com',
    port: 5579,
    dbname: '2018_kxm_dev',
    username: 'kaximu',
    password: 'kaximu2018',
    maxLimit: 1000,
  },

  port: {
    api_svr: 4001,
    file_svr: 4002
  },

  file_svr_domain: 'http://127.0.0.1:4002',

  INVEST_RATES: [6, 3, 1.5, 0.75, 0.38, 0.19, 0.1],

  TRANSACTION_TYPE: {
    ASSETS_IN: 1, // 充值
    ASSETS_OUT: 2, // 提现
    TRANSTER: 3, //转账
    INVEST_IN: 5, // 投资入
    INVEST_OUT: 6, // 投资出
    SCORE_IN: 7, // 积分兑换
    SCORE_OUT: 8, // 积分消费
  },

  key: {
    public: `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC4W8MYWpdITYcq6ocbM1dNzXBj
kP2On1hAl7aYrROIAUQE/vMMqU3of5kvU32+19NnrpF/i77vAXMNrVYmRJc0pHi0
QulGym6PtQsUE3uY6YniB2fKxcqGWDB5fI4Otura+frhvxc2u+NUTcVfl32d6qHi
7wdtHvQKZkDmQQipzwIDAQAB
-----END PUBLIC KEY-----`,
    private: `-----BEGIN RSA PRIVATE KEY-----
MIICWwIBAAKBgQC4W8MYWpdITYcq6ocbM1dNzXBjkP2On1hAl7aYrROIAUQE/vMM
qU3of5kvU32+19NnrpF/i77vAXMNrVYmRJc0pHi0QulGym6PtQsUE3uY6YniB2fK
xcqGWDB5fI4Otura+frhvxc2u+NUTcVfl32d6qHi7wdtHvQKZkDmQQipzwIDAQAB
AoGAIOVOxJO1ltMuoTvD69iXZWyY90sx0zcfmjb3//oyF/yR1IpheArluey6urUd
JOaB9Ggz0hxvb1pE21Xon19x00a/LUTt2eL7cBTu55Ad/BTMXzTeh2oSFKrgqidG
pXQ5dfRfrFJV07E1nk+S+hjHEqm6xTwktnLOQutDpOJ3ZlECQQD1wieoyowdI+la
e0ULxAefnUUrf8iTtMVdQeIPGXpAQk0dEjhBSKbekz2MLU/naSpGfpdiMhGZP08S
tRZs52a7AkEAwAqRl0sbgck0HYzdR/TyeF5GDby+oAkVl48T8ra4Y/FnxnTL8tYB
Jw8Jo5MIjnj9c/HuLznqFznAPY3/ayG5/QJAO6GWufAbu15hWuEaSdaQ+vvQMtPY
uW5djVlVHtDRxxHPYERxffXA97TGdGLyRnZQGbbRyLPZbVPdPe7OuDIVzQJAGI/B
ezYx+HGBZt4jVxavBFIaZ5tiThmbV10HUh2oi6/OdAVwKEjSsOotc2xUxdQXpoKk
0gl4NSw/uB+3MT6JCQJAPNDOuhpy+JJysHlRNw7KeFvj3bxSeJcdzVTdqaDkxv3G
+OSK7E9LgvYupWZEdhiU/htt8OBLoTsWGdiQ2YdKBQ==
-----END RSA PRIVATE KEY-----`
  },

  domain: {
    img1: 'http://127.0.0.1:4004',
    img2: 'http://127.0.0.1:4002',
    h5: 'http://127.0.0.1:4003',
    blockchain: 'http://localhost:8545'
  }

}

let env = process.env.NODE_ENV ? process.env.NODE_ENV : ''

if (env) {
  if (fs.existsSync(path.join(__dirname, './' + env + '.js'))) {
    let extendsConfig = require('./' + env)
    if (extendsConfig) {
      config = Object.assign(config, extendsConfig)
    }
  }

}

module.exports = config