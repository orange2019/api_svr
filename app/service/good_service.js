
const goodModel = require('./../model/mall_goods_model')
const categoryModel = require('./../model/mall_category_model')
const Log = require('./../../lib/log')('good_service')
const errCode = require('./../common/err_code')
class GoodService 
{
    /**
     * 所有广告列表
     * @param {*} ctx 
     */
    async goodList(ctx)
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
        let data = await goodModel().model().findAndCountAll({
            where:where,
            order: [
                ['create_time' , 'DESC']
              ],
            offset: offset, 
            limit: limit
        })
        ret.data = data
        Log.info(ctx.uuid, 'goodList().ret', ret)
        ctx.result = ret
        return ret
    }
    /**
     * 增加商品
     * @param {*} ctx 
     */
    async addGood(ctx)
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
     * 编辑商品
     * @param {*} ctx 
     */
    async modifyGood(ctx)
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

    /**
     * 添加分类
     * @param {*} ctx 
     */
    async addCategory(ctx)
    {
        let ret = {
            code: errCode.SUCCESS.code,
            message: errCode.SUCCESS.message
        }
        Log.info(ctx.uuid, 'addCategory().body', ctx.body)
        let creatObj = {
            pid: ctx.body.pid || 0,
            name: ctx.body.name,
            status: ctx.body.status || 0,
            sort: ctx.body.sort || 0,
        }
        categoryModel().model().create(creatObj)
        return ret;
    }

    /**
     * 修改分类及状态
     * @param {*} ctx 
     */
    async modifyCategory(ctx)
    {
        let ret = {
            code: errCode.SUCCESS.code,
            message: errCode.SUCCESS.message
        }
        Log.info(ctx.uuid, 'modifyCategory().body', ctx.body)
        let allowedFields = ['pid', 'name', 'status', 'sort']
        let categoryInfo = await categoryModel().model().findById(ctx.body.id)
        if (!categoryInfo) {
            ret.code = 4004
            ret.message = '分类不存在'
        } else {
            allowedFields.forEach(element => {
                if(ctx.body[element]){
                    categoryInfo[element] = ctx.body[element]
                } 
            })
            await categoryInfo.save();
        }
        
        
        return ret;
    }

    /**
     * 分类列表
     * @param {*} ctx 
     */
    async categoryList(ctx) {
        let ret = {
            code: errCode.SUCCESS.code,
            message: errCode.SUCCESS.message
        }
        Log.info(ctx.uuid, 'categoryList().body', ctx.body)
        let categoryInfo = await categoryModel().model().findAll()
        Log.info(ctx.uuid, 'categoryList().categoryInfo', categoryInfo)
        // let categoryList = [];
        ret.data = categoryInfo
        return ret
    }

}
module.exports = new GoodService()