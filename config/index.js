const fs = require('fs')
const path = require('path')

let config = {

  db: {
    host: '59939c0a9a983.gz.cdb.myqcloud.com',
    port: 5579,
    dbname: '2018_kaximu_test',
    username: 'kaximu',
    password: 'kaximu2018',
    maxLimit: 1000,
  },

  INVEST_RATES : [6 , 3 , 1.5 , 0.75 , 0.38 , 0.19 , 0.1]

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