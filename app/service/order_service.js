const Log = require('./../../lib/log')('order_service')
const orderModel = require('./../model/mall_order_model')

class OrderService 
{
    /**
     * 订单列表
     * @param {*} ctx 
     */
    async orderList(ctx)
    {
        let ret = {
            code: errCode.SUCCESS.code,
            message: errCode.SUCCESS.message
        }
      
        Log.info(ctx.uuid, 'orderList().body', ctx.body)
      
        let where = {}
        where.user_id = ctx.body.user_id || 0
        let offset = ctx.body.offset || 0
        let limit = ctx.body.limit || 10
        let data = await orderModel().model().findAll({
            where:where,
            order: [
                ['create_time' , 'DESC']
              ],
            offset: offset, 
            limit: limit
        })
        ret.data = data
        Log.info(ctx.uuid, 'orderList().ret', ret)
        ctx.result = ret
        return ret
    }

    async orderDetail(ctx)
    {
        let ret = {
            code: errCode.SUCCESS.code,
            message: errCode.SUCCESS.message
        }
        Log.info(ctx.uuid, 'orderList().body', ctx.body)
        // orderModel().model().findOne()
    }

    async addOrder(ctx)
    {
        
    }
}
module.exports = new OrderService()