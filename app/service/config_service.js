const ConfigModel = require('./../model/config_model')
const Log = require('./../../lib/log')('config_service')
const errCode = require('./../common/err_code')

class ConfigService {

  async value(ctx){
    let ret = {
      code : errCode.SUCCESS.code,
      message : errCode.SUCCESS.message
    }
    Log.info(`${ctx.uuid}|getByName().query` , ctx.query)

    let name = ctx.query.name
    let config = await ConfigModel().model().findOne({
      where : {name : name}
    })
    Log.info(`${ctx.uuid}|getByName().config` , config)
    if(!config){
      ret.code = errCode.FAIL.code
      ret.message = errCode.FAIL.message

      ctx.result = ret
      return ret

    }else {
      if(config.dataValues.type != 1){
        config.dataValues.info = config.dataValues.info ? JSON.parse(config.dataValues.info) : []
      }
      
    }

    ret.data = config ? config.dataValues : null
    Log.info(`${ctx.uuid}|getByName().ret` , ret)
    ctx.result = ret
    return ret
  }

  async submit(ctx){

    let ret = {
      code : errCode.SUCCESS.code,
      message : errCode.SUCCESS.message
    }

    Log.info(`${ctx.uuid}|submit().body` , ctx.body)

    let {name , value} = ctx.body
    let data = {
      name : name
    }
    if(typeof value == 'string'){
      data.type = 1
      data.info = value
    }else {
      data.type = 2
      data.info = JSON.stringify(value)
    }

    let config = await ConfigModel().model().findOne({
      where : {name : name}
    })
    Log.info(`${ctx.uuid}|submit().config` , config)
    Log.info(`${ctx.uuid}|submit().data` , data)
    if(config){
      config.update(data)
    }else {
      config = await ConfigModel().model().create(data)
    }

    ret.data = {id : config.id}
    Log.info(`${ctx.uuid}|submit().ret` , ret)
    ctx.result = ret

    return ret
  }
}

module.exports = new ConfigService