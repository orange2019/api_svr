const InvestModel = require('./../model/invest_model')
const UserModel = require('./../model/user_model')
const Log = require('./../../lib/log')('invest_service')
const errCode = require('./../common/err_code')
const Op = require('sequelize').Op

class InviteService {

  async list(ctx) {

    let ret = {
      code: errCode.SUCCESS.code,
      message: errCode.SUCCESS.message
    }

    Log.info(`${ctx.uuid}|list().body`, ctx.body)

    let list = await InvestModel().model().findAll({
      where: {
        status: {
          [Op.gte]: 0
        }
      },
      order: [
        ['sort', 'asc'],
        ['rate', 'desc']
      ]
    })

    ret.data = {
      list: list
    }

    ctx.result = ret
    Log.info(`${ctx.uuid}|list().ret`, ret)
    return ret
  }

  async update(ctx) {
    let ret = {
      code: errCode.SUCCESS.code,
      message: errCode.SUCCESS.message
    }

    Log.info(`${ctx.uuid}|update().body`, ctx.body)

    let data = ctx.body
    if (data.id) {
      let invest = await InvestModel().model().findById(data.id)
      if (!invest) {
        ret.code = errCode.FAIL.code
        ret.message = '数据错误'
        ctx.result = ret
        return ret
      }

      let updateRet = await invest.update(data)
      ret.data = {
        id: updateRet.id
      }
    } else {
      let invest = await InvestModel().model().create(data)

      ret.data = {
        id: invest.id
      }
    }

    Log.info(`${ctx.uuid}|update().ret`, ret)
    ctx.result = ret
    return ret
  }

  async info(ctx) {
    let ret = {
      code: errCode.SUCCESS.code,
      message: errCode.SUCCESS.message
    }

    Log.info(`${ctx.uuid}|list().body`, ctx.body)
    let {
      id
    } = ctx.body
    if (!id) {
      ret.code = errCode.FAIL.code
      ret.message = '数据错误'
      ctx.result = ret
      return ret

    }

    let invest = await InvestModel().model().findById(id)
    // console.log(invest.num)
    if (invest) {
      ret.data = invest

    } else {
      ret.code = errCode.FAIL.code
      ret.message = '数据错误'

      ctx.result = ret
      return ret
    }

    ctx.result = ret
    return ret
  }

  async status(ctx) {
    let ret = {
      code: errCode.SUCCESS.code,
      message: errCode.SUCCESS.message
    }

    Log.info(`${ctx.uuid}|list().body`, ctx.body)
    let {
      id,
      status
    } = ctx.body
    if (!id) {
      ret.code = errCode.FAIL.code
      ret.message = '数据错误'
      ctx.result = ret
      return ret

    }

    if (status == -1) {
      let count = await UserModel().investModel().count({
        where: {
          invest_id: id
        }
      })

      if (count > 0) {
        ret.code = errCode.FAIL.code
        ret.message = '存在关联数据，无法删除'
        ctx.result = ret
        return ret
      }
    }

    let invest = await InvestModel().model().findById(id)
    if (invest) {
      invest.status = status
      let saveRet = await invest.save()
      ret.data = {
        id: saveRet.id
      }

    } else {
      ret.code = errCode.FAIL.code
      ret.message = '数据错误'
      ctx.result = ret
      return ret
    }

    ctx.result = ret
    return ret

  }
}

module.exports = new InviteService()