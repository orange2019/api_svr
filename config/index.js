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
    TRANSTER: 3, //转账入
    INVEST_IN: 5, // 投资入
    INVEST_OUT: 6, // 投资出
    SCORE_IN: 7, // 积分兑换
    SCORE_OUT: 8, // 积分消费
  },

  key: {
    public: `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCTxS5zZcYCvciblqNcNmPIVKQa
Qcp3LJPAMQuF0D4B+vC6xg7lUa2YtN8eyVowq0z1PypQ7nAfUpWCwSpmS1cjaTcV
viFIc8xRqQVu4vtfIxjX48QGgK+3ir6q+08YLeu2wNqn2E5P62hmkgwVBIHTKA/w
XxRozAUS0L9h53YpSQIDAQAB
-----END PUBLIC KEY-----`,
    private: `-----BEGIN RSA PRIVATE KEY-----
MIICXAIBAAKBgQCTxS5zZcYCvciblqNcNmPIVKQaQcp3LJPAMQuF0D4B+vC6xg7l
Ua2YtN8eyVowq0z1PypQ7nAfUpWCwSpmS1cjaTcVviFIc8xRqQVu4vtfIxjX48QG
gK+3ir6q+08YLeu2wNqn2E5P62hmkgwVBIHTKA/wXxRozAUS0L9h53YpSQIDAQAB
AoGAL+i+JqvYhwsA/3DXhg4cS9clXV33RqwtOyKrmbbqY7n4UpXkPnU800XRESo3
E5B2Yw0XqyWjNISR9NKr7H6AwXsghkUVgMxWYXJp43pHMWRSji96yrMQGcGnmlLb
Mz5O0ru5UYXByETylx8B4shLcPuBQu1lcJCAECTX6pEuzAECQQDeFAjfbxptCa2j
5xe+8QTxkgUlErL/YLozlsxEdisUBnse7yDovVkvhCsj1JOZhZJmAYRYmk1P286P
lwiGYndjAkEAqld3mPa8RPBaqTkQiU85SJyTfdA9XL6kc6tjaFKvG2mndQ1Lks21
4byRlHhBS5XHnTXEI0q10rU17is/cDFqYwJAScUJ9X6onpPadFmtj6XsaHqC7v+5
Kg/tinmLPSqrwKkueOYiXm2XlKso0Wwp45N1QCE831nSWLbBdP1Mvacz1QJAeYt9
6CSuhBZo6nSwavmfq0MmLtDm6AWUPIDfprHRBqNl/Kym7zJfhJpT2nfQR4mxbGjP
8kq94IKy36X2Vyy7dwJBAKXJKABVdHfmk/gZ/SMk3y4PzoMunktbyxY6MbIjEGeQ
OZUBe+Rk2hypwpP1KfI/omEP8N7bv51ytNCsblwodyU=
-----END RSA PRIVATE KEY-----`
  },

  domain: {
    img1: 'http://127.0.0.1:4004',
    img2: 'http://127.0.0.1:4002',

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