const fs = require('fs')
const path = require('path')

let config = {

  // aliyun
  db: {
    host: 'rm-wz9077258c2ibppy7ro.mysql.rds.aliyuncs.com',
    port: 3306,
    dbname: 'kxm2018',
    username: 'kxm_2018',
    password: 'kxm-2018',
    maxLimit: 600,
  },

  oss: {
    region: 'oss-cn-shenzhen',
    accessKeyId: 'LTAIuZAB2acD7SpJ',
    accessKeySecret: 'FMpk7JlIIGbhSCS5q0A5VZOSk5uthV',
    bucket: 'kxm-img',
  },

  port: {
    api_svr: 4001
  },

  INVEST_RATES: [3, 1.5, 0.75, 0.38, 0.19, 0.1],

  TRANSACTION_TYPE: {
    ASSETS_IN: 1, // 充值
    ASSETS_OUT: 2, // 提现
    TRANSTER: 3, //转账
    INVEST_OUT: 4, // 投资出
    INVEST_IN: 5, // 投资入
    INVEST_IN_SUB: 6, // 投资子级入
    FROZEN: 7, // 冻结
    UNFROZEN: 8, // 解冻
    INVEST_FROZEN: 9, // 投资解冻
    SCORE_EXCAHNGE: 10, // 积分兑换
  },

  key: {
    public: `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCha4PTmuTq9K3tHKUAe1a/BlUf
Ae90TilIdXt3fRZhorwNqn957wpNA52Ck7usq9fkD70+6KAn8/b/cketJC6dMX2V
gZx3IZGwvKZUG8yWIZhEO/J55v82tX1PPgq16lCrhfY9x8BVKwkxE94UF4eKEJGa
GAS9Ix1QF0uCkHMg3wIDAQAB
-----END PUBLIC KEY-----`,
    private: `-----BEGIN RSA PRIVATE KEY-----
MIICWwIBAAKBgQCha4PTmuTq9K3tHKUAe1a/BlUfAe90TilIdXt3fRZhorwNqn95
7wpNA52Ck7usq9fkD70+6KAn8/b/cketJC6dMX2VgZx3IZGwvKZUG8yWIZhEO/J5
5v82tX1PPgq16lCrhfY9x8BVKwkxE94UF4eKEJGaGAS9Ix1QF0uCkHMg3wIDAQAB
AoGAClPXplU1qjanXhFEGUjK3wPntEkqadWKXKFvmdB9+xcvUuyCpWl+zjiZ/j23
dy+za1r6b6jwfj3koqlMHq6+8KOzAKrRj5cdhedCVMjLrWmMHqdl/I+Ek+Y/1XTt
+J54vLGED+TSzqJcdMu/+z3ipOVfVSQTFe7w543AJ8zDrBkCQQDOognuqZy5wUPF
lF24vlkbwQ73NQpKRntzG7RIT5x4eK/j29fwd+j+5gdzJH/OeDP/k8QnKEzK0iT6
y0PwswPdAkEAx/wv0hCPwY6MDhLA5VEkGVhyiQU8968POCP1ZUAp9p1cY3n7zAGS
YcxlJJ2OT2qgH8CwbcOW3lE+XUwSHtYZ6wJASHNybhdUl6EXJTjvX66GSf/4Ql97
my15bZPiM5SOdYNDkO5tmahBrtZy+EFs+rUU7mEeXuh3fIoQY0tQKB5slQJAG3UO
g8LuWd7eb9g3T8TSNgCkyRdFBaStbEHToXEr0cZNNwM6hQn6NR9BC8PuFA1JqtJj
5s4h2qhA7cJSApXWvQJAdbbnrJCu52y6UO3sGTithsW9wxq/hPVW1b+8egxVW1wL
vZxq5+sTEOH9XTvgelNqN025jVpeNPeeUQcFDY5jWg==
-----END RSA PRIVATE KEY-----`
  },

  domain: {
    h5: 'http://h5.kaximumck.com',
    oss: ''
  },

  // blockchain_port: 'http://ec2-54-169-177-12.ap-southeast-1.compute.amazonaws.com:8545',
  // default_contract_id: 1,
  blockchain_port: 'http://47.75.155.158:8545',
  default_contract_id: 1,
  chainId: '666',
  decimals: 100000000,
  scoreRete: 1,
  assetsInMobile: ''
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

console.log('config db host:', config.db.host)
console.log('config db default_contract_id:', config.default_contract_id)
module.exports = config