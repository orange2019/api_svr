const Log = require('./../../lib/log')('order_service')
const orderModel = require('./../model/mall_order_model')
const userAssetsModel = require('./../model/user_assets_model')
const errCode = require('./../common/err_code')

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

    /**
     * 订单细节
     * @param {*} ctx 
     */
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
        Log.info(ctx.uuid, 'orderCancel().body', ctx.body)

        let orderInfo = await orderModel().model().findById(ctx.body.order_id);
        if (!orderInfo) {
            ret.code = 404;
            ret.message = '不存在记录';
            return ret;
        }

        orderInfo.status = -1;
        await orderInfo.save();
        ctx.result = ret
        return ret;
    }

    /**
     * 支付订单
     * @param {*} ctx 
     */
    async pay(ctx)
    {
        let ret = {
            code: errCode.SUCCESS.code,
            message: errCode.SUCCESS.message
        }
        Log.info(ctx.uuid, 'pay().body', ctx.body)
        //开启事物
        let t = orderModel.getTrans();
        try{
            let orderInfo = await orderModel().model().findById(ctx.body.order_id)
            let orderAmount = orderInfo.amount
            let user = await userAssetsModel().model().findOne({
                where: {
                    user_id: ctx.body.user_id
                }
            })
            let userAmount = user.amount
            //积分不足
            if( userAmount < orderAmount ){
                ret.code = errCode.ORDER.amountNotEnough.code
                ret.message = errCode.ORDER.amountNotEnough.message
                t.rollback()
                ctx.result = ret
                return ret
            }
            //扣除积分
            let assetsUpdate = await user.update(
                { amount: userAmount- orderAmount }, 
                { transaction: t}
            );
            //更改订单状态
            let orderUpdate = await orderInfo.update(
                { status: 2 }, 
                { transaction: t}
            )
            Log.info(ctx.uuid, 'assetsUpdate', assetsUpdate,'orderUpdate',orderUpdate)
            if ( !userAssetUpdate || !orderUpdate ) {
                ret.code = errCode.FAIL.code
                ret.message = '付款失败'
                t.rollback()
                ctx.result = ret
                return ret
            }
        }catch{
            //错误即回滚
            ret.code = errCode.FAIL.code
            ret.message = err.message || 'err'
            t.rollback()
            ctx.result = ret
            return ret
        }
        t.commit()
        ctx.result = ret
        return ret

    }
}
module.exports = new OrderService()