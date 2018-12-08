const Log = require('./../../lib/log')('order_service')
const adModel = require('./../model/mall_ad_model')
const errCode = require('./../common/err_code')
class AdService 
{
    /**
     * 所有广告列表
     * @param {*} ctx 
     */
    async adList(ctx)
    {
        let ret = {
            code: errCode.SUCCESS.code,
            message: errCode.SUCCESS.message
        }
      
        Log.info(ctx.uuid, 'adList().body', ctx.body)
      
        let where = {}
        // where.user_id = ctx.body.user_id || 0
        let offset = ctx.body.offset || 0
        let limit = ctx.body.limit || 10
        let data = await adModel().model().findAndCountAll({
            where:where,
            order: [
                ['create_time' , 'DESC']
              ],
            offset: offset, 
            limit: limit
        })
        ret.data = data
        Log.info(ctx.uuid, 'adList().ret', ret)
        ctx.result = ret
        return ret
    }
    /**
     * 增加广告
     * @param {*} ctx 
     */
    async adAdd(ctx)
    {
        let ret = {
            code: errCode.SUCCESS.code,
            message: errCode.SUCCESS.message
        }
        Log.info(ctx.uuid, 'orderList().body', ctx.body)
        let createRow = {};
        try{
            createRow.title = ctx.body.title
            createRow.description =  ctx.body.description
            createRow.photo  =  ctx.body.photo
            createRow.link   =  ctx.body.link
            createRow.status = ctx.body.status || 0
            createRow.sort   = ctx.body.sort   || 0
        }catch{
            ret.code = 400
            ret.message = '参数错误'
            return ret
        }
        await adModel().model().create(createRow)
        // ret.data = data
        Log.info(ctx.uuid, 'adList().ret', ret)
        // ctx.result = ret
        return ret
    }

    /**
     * 已经投放的广告列表
     * @param {*} ctx 
     */
    async publishList(ctx)
    {
        let ret = {
            code: errCode.SUCCESS.code,
            message: errCode.SUCCESS.message
        }
      
        Log.info(ctx.uuid, 'publishList().body', ctx.body)
      
        let where = {
            status : 1
        }
        // where.user_id = ctx.body.user_id || 0
        // let offset = ctx.body.offset || 0
        // let limit = ctx.body.limit || 10
        let data = await adModel().model().findAll({
            where:where,
            order: [
                ['sort' , 'ASC']
              ],
            // offset: offset, 
            // limit: limit
        })
        ret.data = data
        Log.info(ctx.uuid, 'publishList().ret', ret)
        ctx.result = ret
        return ret
    }

    /**
     * 编辑广告
     * @param {*} ctx 
     */
    async modifyAdd(ctx)
    {
        let ret = {
            code: errCode.SUCCESS.code,
            message: errCode.SUCCESS.message
        }
        Log.info(ctx.uuid, 'modifyAdd().body', ctx.body)

        let adInfo = await UserModel().model().findById(ctx.body.ad_id);
        if (!adInfo) {
            ret.code = 404;
            ret.message = '不存在记录';
            return ret;
        }
        
        adInfo.status = ctx.body.status;
        adInfo.sort = ctx.body.sort;
        await adInfo.save();
        return ret;
    }

}
module.exports = new AdService()