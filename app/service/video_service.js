const Log = require('./../../lib/log')('video_service')
const VideoModel = require('./../model/video_model')
const errCode = require('./../common/err_code')
const dateUtils = require('./../utils/date_utils')
const Op = require('sequelize').Op

class VideoService {

  async h5List(ctx) {
    let ret = {
      code: errCode.SUCCESS.code,
      message: errCode.SUCCESS.message
    }
    Log.info(`${ctx.uuid}|h5List().query`, ctx.query)

    let where = {}
    let offset = parseInt(ctx.query.offset) || 0
    let limit = parseInt(ctx.query.limit) || 0


    where.status = 1

    let opts = {
      where: where,
      order: [
        ['sort', 'asc'],
        ['create_time', 'DESC']
      ]
    }

    if (limit) {
      opts.offset = offset
      opts.limit = limit
    }
    Log.info(`${ctx.uuid}|list().where`, where)
    let queryRet = await VideoModel().model().findAndCountAll(opts)

    ret.data = queryRet

    Log.info(`${ctx.uuid}|list().ret`, ret)
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

    Log.info(`${ctx.uuid}|list().where`, where)

    let data = await VideoModel().model().findAndCountAll({
      where: where,
      offset: (page - 1) * limit,
      limit: limit,
      order: [
        ['sort', 'asc'],
        ['create_time', 'DESC']
      ]
    })

    Log.info(`${ctx.uuid}|list().data`, data)
    data.page = page
    data.limit = limit
    ret.data = data
    ctx.result = ret
    return ret

  }

  async detail(ctx) {
    let ret = {
      code: errCode.SUCCESS.code,
      message: errCode.SUCCESS.message
    }
    Log.info(`${ctx.uuid}|detail().query`, ctx.query)
    let videoId = ctx.query.video_id || 0


    if (!videoId) {
      ret.code = errCode.FAIL.code
      ret.message = '未找到对应信息'

      ctx.result = ret
      return ret
    }

    let video = await VideoModel().model().findById(videoId)
    Log.info(`${ctx.uuid}|detail().video`, video)
    if (!video) {
      ret.code = errCode.ADMIN.videoFindError.code
      ret.message = errCode.ADMIN.videoFindError.message

      ctx.result = ret
      return ret
    }

    let videoData = video.dataValues
    videoData.post_time = dateUtils.dateFormat(videoData.post_time, 'YYYY-MM-DDTHH:mm')

    ret.data = videoData
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
    Log.info(`${ctx.uuid}|update().updateData`, updateData)

    if (updateData.id) {
      // 修改
      let video = await VideoModel().model().findById(updateData.id)
      Log.info(`${ctx.uuid}|update().video`, video)
      if (!video) {
        ret.code = errCode.FAIL.code
        ret.message = '未找到对应信息'

        ctx.result = ret
        return ret
      }

      let updateRet = await video.update(updateData)
      Log.info(`${ctx.uuid}|update().updateRet`, updateRet)
      if (!updateRet.id) {
        ret.code = errCode.FAIL.code
        ret.message = '更新失败'
      }

      ret.data = {
        id: updateRet.id
      }
      ctx.result = ret
      Log.info(`${ctx.uuid}|update().ret`, ret)
      return ret

    } else {
      let video = await VideoModel().model().create(updateData)
      Log.info(`${ctx.uuid}|update().video`, video)
      if (!video.id) {
        ret.code = errCode.FAIL.code
        ret.message = '添加失败'
      }

      ret.data = {
        id: video.id
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
    let videoId = ctx.body.video_id || 0
    let status = ctx.body.status || 0

    if (!videoId) {
      ret.code = errCode.ADMIN.videoFindError.code
      ret.message = errCode.ADMIN.videoFindError.message

      ctx.result = ret
      return ret
    }

    let video = await VideoModel().model().findById(videoId)
    Log.info(`${ctx.uuid}|status().video`, video)
    if (!video) {
      ret.code = errCode.ADMIN.videoFindError.code
      ret.message = errCode.ADMIN.videoFindError.message

      ctx.result = ret
      return ret
    }

    if (status == 0 || status == -1 || status == 1) {
      // 修改状态
      video.status = status
      await video.save()
    } else {
      // 删除
      // await video.destroy()
    }

    ctx.result = ret
    Log.info(`${ctx.uuid}|status().ret`, ret)
    return ret

  }

  /**
   * 添加视频
   * @param {*} ctx 
   */
  async add(ctx) {
    let ret = {
      code: errCode.SUCCESS.code,
      message: errCode.SUCCESS.message
    }
    Log.info(ctx.uuid, 'addCategory().body', ctx.body)
    let creatObj = {
        title: ctx.body.title,
        description: ctx.body.description,
        url: ctx.body.url,
        status: ctx.body.status || 0,
        sort: ctx.body.sort || 0,
    }
    await VideoModel().model().create(creatObj)
    ctx.result = ret
    return ret;

  }


}

module.exports = new VideoService