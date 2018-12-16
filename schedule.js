const NodeSchedule = require('node-schedule')
const UserInvestService = require('./app/service/user_invest_service')
const request = require('superagent')
const Log = require('./lib/log')

module.exports = {
  start() {
    console.log('start ........')

    NodeSchedule.scheduleJob('*/30 * * * * *', () => {
      const log = Log('heart_test')
      log.info('heart test start')
      request.get('http://127.0.0.1:4001/test', (err, ret) => {
        // console.log(ret.text)
        log.info('heart test res ', ret.text)
        // console.log(ret)
      })
    })

    // 每天凌晨0：30
    NodeSchedule.scheduleJob('0 30 0 * * *', () => {

      const log = Log('investComputes')
      log.info('UserInvestService.investComputes() start at ' + new Date())
      UserInvestService.investComputes(log).then(() => {
        log.info('UserInvestService.investComputes() end at ' + new Date())
      })
    })
  }
}