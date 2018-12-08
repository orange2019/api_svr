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
        // -1:已取消,0:已完成,1:已下单,2:已付款,3:已发货
        let allowed = ['status']
        allowed.forEach(element => {
            if(ctx.body[element]){
                where[element] = ctx.body[element]
            }  
        })
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

    async orderAdd(ctx)
    {
        
    }

    /**
     * 订单取消
     * @param {*} ctx 
     */
    async orderCancel(ctx)
    {
        let ret = {
            code: errCode.SUCCESS.code,
            message: errCode.SUCCESS.message
        }
        Log.info(ctx.uuid, 'modifyAdd().body', ctx.body)

        let orderInfo = await orderModel().model().findById(ctx.body.order_id);
        if (!orderInfo) {
            ret.code = 404;
            ret.message = '不存在记录';
            return ret;
        }

        orderInfo.status = -1;
        await orderInfo.save();
        return ret;
    }

    async pay()
    {

    }
}
module.exports = new OrderService()