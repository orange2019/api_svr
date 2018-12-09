const Log = require('./../../lib/log')('news_service')
const newsModel = require('./../model/news_model')
const errCode = require('./../common/err_code')
const dateUtils = require('./../utils/date_utils')
const Op = require('sequelize').Op
const {
  domain
} = require('./../../config')

class NewsService {

  async h5List(ctx) {
    let ret = {
      code: errCode.SUCCESS.code,
      message: errCode.SUCCESS.message
    }
    Log.info(`${ctx.uuid}|h5List().query`, ctx.query)

    let where = {}
    let offset = parseInt(ctx.query.offset) || 0
    let limit = parseInt(ctx.query.limit) || 10
    let category = ctx.query.category ? ctx.query.category.toUpperCase() : 'NOTICE'
    where.status = 1
    where.type = ctx.query.type || 1
    where.category = category
    Log.info(`${ctx.uuid}|list().where`, where)
    let queryRet = await newsModel().model().findAndCountAll({
      where: where,
      offset: offset,
      limit: limit,
      attributes: {
        exclude: ['content']
      },
      order: [
        ['sort', 'asc'],
        ['post_time', 'DESC']
      ]
    })

    queryRet.rows.forEach(item => {
      item.dataValues.cover = domain.img1 + item.dataValues.cover
    })
    ret.data = queryRet
    ctx.result = ret
    return ret
  }

  async list(ctx) {

    let ret = {
      code: errCode.SUCCESS.code,
      message: errCode.SUCCESS.message
    }
    Log.info(`${ctx.uuid}|list().query`, ctx.query)

    let where = {}
    let page = parseInt(ctx.query.page) || 1
    let limit = parseInt(ctx.query.limit) || 10

    where.status = {
      [Op.gte]: 0
    }
    let adminType = ctx.session.admin.type
    where.type = adminType || ctx.query.type || 1

    Log.info(`${ctx.uuid}|list().where`, where)

    let queryList = newsModel().model().findAll({
      where: where,
      offset: (page - 1) * limit,
      limit: limit,
      order: [
        ['sort', 'asc'],
        ['post_time', 'DESC']
      ]
    })
    let queryCount = newsModel().model().count({
      where: where
    })

    let queryRet = await Promise.all([queryList, queryCount])

    Log.info(`${ctx.uuid}|list().queryRet`, queryRet)
    ret.data = {
      list: queryRet[0] || [],
      count: queryRet[1],
      page: page,
      limit: limit
    }
    ctx.result = ret
    return ret

  }

  async detail(ctx) {
    let ret = {
      code: errCode.SUCCESS.code,
      message: errCode.SUCCESS.message
    }
    Log.info(`${ctx.uuid}|detail().query`, ctx.query)
    let newsId = ctx.query.news_id || 0


    if (!newsId) {
      ret.code = errCode.ADMIN.newsFindError.code
      ret.message = errCode.ADMIN.newsFindError.message

      ctx.result = ret
      return ret
    }

    let news = await newsModel().model().findById(newsId)
    Log.info(`${ctx.uuid}|detail().news`, news)
    if (!news) {
      ret.code = errCode.ADMIN.newsFindError.code
      ret.message = errCode.ADMIN.newsFindError.message

      ctx.result = ret
      return ret
    }

    let newsData = news.dataValues
    newsData.post_time = dateUtils.dateFormat(newsData.post_time, 'YYYY-MM-DDTHH:mm')

    ret.data = newsData
    ctx.result = ret

    Log.info(`${ctx.uuid}|detail().ret`, ret)
    return ret
  }

  /**
   * 更新新闻资讯
   * @param {*} ctx 
   */
  async update(ctx) {
    let ret = {
      code: errCode.SUCCESS.code,
      message: errCode.SUCCESS.message
    }

    let updateData = ctx.body
    Log.info(`${ctx.uuid}|update().body`, updateData)
    updateData.admin_id = ctx.session.admin.id
    if (typeof updateData.post_time === 'string') {
      let postTime = updateData.post_time.replace('T', ' ')
      Log.info(`${ctx.uuid}|update().postTime`, postTime)
      updateData.post_time = dateUtils.getTimestamp(postTime)
      Log.info(`${ctx.uuid}|update().postTime`, updateData.post_time)
    }
    Log.info(`${ctx.uuid}|update().updateData`, updateData)

    if (updateData.id) {

      // 修改
      let news = await newsModel().model().findById(updateData.id)
      Log.info(`${ctx.uuid}|update().news`, news)
      if (!news) {
        ret.code = errCode.ADMIN.newsFindError.code
        ret.message = errCode.ADMIN.newsFindError.message

        ctx.result = ret
        return ret
      }

      let updateRet = await news.update(updateData)
      Log.info(`${ctx.uuid}|update().updateRet`, updateRet)
      if (!updateRet.id) {
        ret.code = errCode.ADMIN.newsUpdateError.code
        ret.message = errCode.ADMIN.newsUpdateError.message
      }

      ret.data = {
        id: updateRet.id
      }
      ctx.result = ret
      Log.info(`${ctx.uuid}|update().ret`, ret)
      return ret

    } else {
      let news = await newsModel().model().create(updateData)
      Log.info(`${ctx.uuid}|update().news`, news)
      if (!news.id) {
        ret.code = errCode.ADMIN.newsUpdateError.code
        ret.message = errCode.ADMIN.newsUpdateError.message
      }

      ret.data = {
        id: news.id
      }
      ctx.result = ret
      Log.info(`${ctx.uuid}|update().ret`, ret)
      return ret

    }

  }

  /**
   * 修改状态
   * @param {*} ctx 
   */
  async status(ctx) {
    let ret = {
      code: errCode.SUCCESS.code,
      message: errCode.SUCCESS.message
    }

    Log.info(`${ctx.uuid}|status().body`, ctx.body)
    let newsId = ctx.body.news_id || 0
    let status = ctx.body.status || 0

    if (!newsId) {
      ret.code = errCode.ADMIN.newsFindError.code
      ret.message = errCode.ADMIN.newsFindError.message

      ctx.result = ret
      return ret
    }

    let news = await newsModel().model().findById(newsId)
    Log.info(`${ctx.uuid}|status().news`, news)
    if (!news) {
      ret.code = errCode.ADMIN.newsFindError.code
      ret.message = errCode.ADMIN.newsFindError.message

      ctx.result = ret
      return ret
    }

    if (status == 0 || status == -1 || status == 1) {
      // 修改状态
      news.status = status
      await news.save()
    } else {
      // 删除
      // await news.destroy()
    }

    ctx.result = ret
    Log.info(`${ctx.uuid}|status().ret`, ret)
    return ret

  }


}

module.exports = new NewsService