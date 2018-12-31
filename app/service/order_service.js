const Log = require('../../lib/log')('order_service')
const userModel = require('../model/user_model')
const orderModel = require('../model/mall_order_model')
const payModel = require('../model/mall_pay_model')
const mallGoodsModel = require('../model/mall_goods_model')
const errCode = require('../common/err_code')
const cryptoUtils = require('./../utils/crypto_utils')
const Op = require('sequelize').Op

class OrderService {
  /**
   * 订单列表
   * @param {*} ctx 
   */
  async list(ctx) {
    let ret = {
      code: errCode.SUCCESS.code,
      message: errCode.SUCCESS.message
    }

    Log.info(ctx.uuid, 'orderList().body', ctx.body)

    let where = {}
    where.user_id = ctx.body.user_id || 0
    // -1:已取消,0:已完成,1:已下单,2:已付款,3:已发货
    // let allowed = ['status']
    // allowed.forEach(element => {
    //     if (ctx.body[element]) {
    //         where[element] = ctx.body[element]
    //     }
    // })
    if (ctx.body.hasOwnProperty('status')) {
      where.status = ctx.body.status
    }

    let offset = ctx.body.offset || 0
    let limit = ctx.body.limit || 10
    let data = await orderModel().model().findAndCountAll({
      where: where,
      order: [
        ['update_time', 'DESC'],
        ['status', 'DESC']

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
   * 确认收货完成
   * @param {*} ctx 
   */
  async confirm(ctx) {
    let ret = {
      code: errCode.SUCCESS.code,
      message: errCode.SUCCESS.message
    }
    Log.info(ctx.uuid, 'orderCancel().body', ctx.body)
    let userId = ctx.body.user_id
    let orderId = ctx.body.order_id

    let t = await orderModel().getTrans()
    try {
      let orderInfo = await orderModel().model().findById(orderId)
      Log.info(ctx.uuid, 'orderCancel().orderInfo', orderInfo)
      if (!orderInfo || orderInfo.user_id != userId) {
        throw new Error('无效订单')
      }
      if (orderInfo.status != 3) {
        throw new Error('订单还未支付或者发货')
      }

      orderInfo.status = 0
      let orderUpdateRet = await orderInfo.save({
        transaction: t
      })
      if (!orderUpdateRet) {
        throw new Error('订单确认失败，请稍后重试')
      }

      t.commit()
    } catch (err) {
      ret.code = errCode.FAIL.code
      ret.message = err.message || 'err'
      t.rollback()
    }

    ctx.result = ret
    return ret
  }

  /**
   * 订单取消
   * @param {*} ctx 
   */
  async cancel(ctx) {
    let ret = {
      code: errCode.SUCCESS.code,
      message: errCode.SUCCESS.message
    }
    Log.info(ctx.uuid, 'orderCancel().body', ctx.body)
    let userId = ctx.body.user_id
    let orderId = ctx.body.order_id

    let t = await orderModel().getTrans()
    try {
      let orderInfo = await orderModel().model().findById(orderId)
      Log.info(ctx.uuid, 'orderCancel().orderInfo', orderInfo)
      if (!orderInfo || orderInfo.user_id != userId) {
        throw new Error('无效订单')
      }
      if (orderInfo.status != 1) {
        throw new Error('订单已支付')
      }

      let items = orderInfo.goods_items
      for (let index = 0; index < items.length; index++) {
        let item = items[index]
        let mallGoods = await mallGoodsModel().model().findById(item.id)
        if (mallGoods.stock == -1) {
          mallGoods.stock = mallGoods.stock - item.count
          let goodsUpdateRet = await mallGoods.save({
            transaction: t
          })
          if (!goodsUpdateRet) {
            throw new Error(`${mallGoods.name}库存扣除失败`)
          }
        }
      }

      orderInfo.status = -1
      let orderUpdateRet = await orderInfo.save({
        transaction: t
      })
      if (!orderUpdateRet) {
        throw new Error('订单取消失败，请稍后重试')
      }

      t.commit()
    } catch (err) {
      ret.code = errCode.FAIL.code
      ret.message = err.message || 'err'
      t.rollback()
    }

    ctx.result = ret
    return ret
  }

  /**
   * 支付订单
   * @param {*} ctx 
   */
  async pay(ctx) {
    let ret = {
      code: errCode.SUCCESS.code,
      message: errCode.SUCCESS.message
    }
    Log.info(ctx.uuid, 'pay().body', ctx.body)
    let userId = ctx.body.user_id
    let orderId = ctx.body.order_id
    let password = ctx.body.password
    let remark = ctx.body.remark


    //开启事物
    let t = await orderModel().getTrans()
    try {
      let user = await userModel().model().findById(userId)

      if (user.password_trade == '') {
        throw new Error('未设置支付密码')
      }

      if (user.password_trade != cryptoUtils.md5(password)) {
        if (user.password != cryptoUtils.md5(password)) {
          throw new Error('支付密码验证错误')
        }
      }

      let orderInfo = await orderModel().model().findById(orderId)
      if (!orderInfo || orderInfo.user_id != userId) {
        throw new Error('无效订单')
      }

      if (orderInfo.status != 1) {
        throw new Error('订单已支付或取消')
      }

      let orderAmount = orderInfo.amount
      let userAssets = await userModel().getAssetsByUserId(userId)
      let userScore = userAssets.score
      //积分不足
      if (userScore < orderAmount) {
        throw new Error('积分余额不足')
      }

      // 判断商品库存
      // let items = orderInfo.goods_items
      // for (let index = 0; index < items.length; index++) {
      //   let item = items[index]
      //   let mallGoods = await mallGoodsModel().model().findById(item.id)
      //   if (mallGoods.stock == -1) {
      //     continue
      //   }

      //   if (mallGoods.stock < item.count) {
      //     throw new Error(`${mallGoods.name}库存不足`)
      //   } else {
      //     mallGoods.stock = mallGoods.stock - item.count
      //     let goodsUpdateRet = await mallGoods.save({
      //       transaction: t
      //     })
      //     if (!goodsUpdateRet) {
      //       throw new Error(`${mallGoods.name}库存扣除失败`)
      //     }
      //   }
      // }

      //扣除积分
      userAssets.score = userScore - orderAmount
      let assetsUpdate = await userAssets.save({
        transaction: t
      })
      if (!assetsUpdate) {
        throw new Error('扣除积分失败')
      }

      //更改订单状态
      orderInfo.status = 2
      orderInfo.remark = remark
      let orderUpdate = await orderInfo.save({
        transaction: t
      })
      if (!orderUpdate) {
        throw new Error('订单更新失败')
      }

      // 记录积分使用
      let payRet = await payModel().model().create({
        user_id: userId,
        order_id: orderInfo.id,
        num: orderAmount,
        type: 1
      }, {
        transaction: t
      })
      if (!payRet) {
        throw new Error('记录支付失败')
      }

      t.commit()
    } catch (err) {
      //错误即回滚
      ret.code = errCode.FAIL.code
      ret.message = err.message || 'err'
      t.rollback()

    }

    ctx.result = ret
    return ret

  }

  /**
   * 查找订单信息
   * @param {*} ctx 
   */
  async findOrderById(order_id) {

    return await orderModel().model().findById(order_id)
  }

  async create(ctx) {
    let ret = {
      code: errCode.SUCCESS.code,
      message: errCode.SUCCESS.message
    }
    Log.info(ctx.uuid, 'create().body', ctx.body)
    //开启事物
    let t = await orderModel().getTrans()

    try {
      let userId = ctx.body.user_id
      let address = ctx.body.address || ''
      let items = ctx.body.items
      let remark = ctx.body.remark || ''

      console.log(items)

      let totalPrice = 0
      let goodsIds = []
      let goodsItems = []
      for (let index = 0; index < items.length; index++) {
        let item = items[index]
        let mallGoods = await mallGoodsModel().model().findById(item.id)
        if (mallGoods.stock != -1) {
          if (mallGoods.stock < item.count) {
            throw new Error(`${mallGoods.name}库存不足`)
          } else {
            mallGoods.stock = mallGoods.stock - item.count
            let goodsUpdateRet = await mallGoods.save({
              transaction: t
            })
            if (!goodsUpdateRet) {
              throw new Error(`${mallGoods.name}库存扣除失败`)
            }
          }
        }

        totalPrice += mallGoods.price * item.count * 100
        goodsIds.push(item.id)
        goodsItems.push({
          id: mallGoods.id,
          name: mallGoods.name,
          price: mallGoods.price,
          cover: mallGoods.cover,
          count: item.count
        })
      }

      totalPrice = totalPrice / 100
      // if (userAssets < totalPrice) {
      //     throw new Error('积分余额不足')
      // }

      // 创建订单
      let order = await orderModel().model().create({
        user_id: userId,
        goods_ids: '-' + goodsIds.join('-') + '-',
        goods_items: goodsItems,
        amount: totalPrice,
        address: address,
        remark: remark
      })

      if (order.id) {
        ret.data = {
          id: order.id
        }
      } else {
        throw new Error('订单生产失败，请稍后再试')
      }

      t.commit()
    } catch (err) {
      // console.log(err)
      t.rollback()
      ret.code = errCode.FAIL.code
      ret.message = err.message || '请求失败，请稍后再试'
    }

    ctx.result = ret
    return ret
  }

  async info(ctx) {
    let ret = {
      code: errCode.SUCCESS.code,
      message: errCode.SUCCESS.message
    }
    Log.info(ctx.uuid, 'info().body', ctx.body)

    let userId = ctx.body.user_id
    let orderId = ctx.body.order_id

    let order = await this.findOrderById(orderId)
    Log.info(ctx.uuid, 'info().order', order)
    if (!order || order.user_id != userId) {
      ret.code = errCode.FAIL.code
      ret.message = '无效订单'
    } else {
      ret.data = order
    }

    ctx.result = ret
    return ret

  }


  async orderDetail(ctx) {
    let ret = {
      code: errCode.SUCCESS.code,
      message: errCode.SUCCESS.message
    }
    Log.info(ctx.uuid, 'orderDetail().body', ctx.body)
    let orderId = ctx.body.order_id
    let order = await this.findOrderById(orderId)
    Log.info(ctx.uuid, 'orderDetail', order)
    ret.data = order
    ctx.result = ret
    return ret
  }

}

module.exports = new OrderService()