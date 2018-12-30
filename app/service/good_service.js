const goodModel = require('./../model/mall_goods_model')
const categoryModel = require('./../model/mall_category_model')
const Log = require('./../../lib/log')('good_service')
const errCode = require('./../common/err_code')
class GoodService {

    /**
     * 添加分类
     * @param {*} ctx 
     */
    async addCategory(ctx) {
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
    async modifyCategory(ctx) {
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
                if (ctx.body[element]) {
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

    /**
     * 获取商品详情
     * @param {*} ctx 
     */
    async getDetailById(ctx) {
        let ret = {
            code: errCode.SUCCESS.code,
            message: errCode.SUCCESS.message
        }
        Log.info(ctx.uuid, 'getDetailById().body', ctx.body)
        let goodInfo = await goodModel().model().findByPk(ctx.body.id)
        let categoryInfo = await categoryModel().model().findById(goodInfo.c_id)
        goodInfo.categoryInfo = categoryInfo
        Log.info(ctx.uuid, 'getDetailById().goodInfo', goodInfo, 'categoryInfo:', categoryInfo)
        ret.data = {
            'goodInfo': goodInfo,
            'categoryInfo': categoryInfo
        }

        ctx.result = ret
        return ret
    }

    /**
     * 修改商品信息
     * @param {*} ctx 
     */
    async modifyGood(ctx) {
        let ret = {
            code: errCode.SUCCESS.code,
            message: errCode.SUCCESS.message
        }
        Log.info(ctx.uuid, 'modifyGood().body', ctx.body)
        let allowedFields = ['c_id', 'name', 'cover', 'info', 'price', 'status', 'stock', 'description']
        let goodInfo = await goodModel().model().findById(ctx.body.id)
        Log.info(ctx.uuid, 'modifyGood().goodInfo', goodInfo)
        if (!goodInfo) {
            ret.code = 4004
            ret.message = '商品不存在'
        } else {
            allowedFields.forEach(element => {
                if (null != ctx.body[element]) {
                    goodInfo[element] = ctx.body[element]
                }
            })
            await goodInfo.save();
            Log.info(ctx.uuid, 'modifyGood().goodInfo', goodInfo)
        }

        ctx.result = ret
        return ret;
    }

    /**
     * 商品列表
     * @param {*} ctx 
     */
    async goodList(ctx) {
        let ret = {
            code: errCode.SUCCESS.code,
            message: errCode.SUCCESS.message
        }

        Log.info(ctx.uuid, 'goodList().body', ctx.body)
        let page = parseInt(ctx.query.page) || 1
        let limit = parseInt(ctx.query.limit) || 10

        let where = {
            // status : 1
        }
        let allowedFields = ['c_id', 'name', 'status', 'stock']
        allowedFields.forEach(element => {
            if (ctx.body[element]) {
                goodInfo[element] = ctx.body[element]
            }
        })
        let queryList = await goodModel().model().findAll({
            offset: (page - 1) * limit,
            limit: limit,
            order: [
                ['id', 'DESC']
            ],
        })
        let queryCount = await goodModel().model().count({
            where: where
        })
        Log.info(ctx.uuid, 'goodList().queryCount', queryCount)

        ret.data = {
            list: queryList || [],
            count: queryCount,
            page: page,
            limit: limit
        }
        Log.info(ctx.uuid, 'goodList().ret', ret)
        ctx.result = ret
        return ret
    }

    /**
     * 增加商品
     * @param {*} ctx 
     */
    async addGood(ctx) {
        let ret = {
            code: errCode.SUCCESS.code,
            message: errCode.SUCCESS.message
        }
        Log.info(ctx.uuid, 'addGood().body', ctx.body)
        let createRow = {};
        try {
            createRow.c_id = ctx.body.c_id || 0
            createRow.name = ctx.body.name
            createRow.cover = ctx.body.cover
            createRow.info = ctx.body.info
            createRow.price = ctx.body.price
            createRow.stock = ctx.body.stock || 0 //库存
            createRow.description = ctx.body.description || ''
            createRow.status = ctx.body.status || 0
        } catch {
            ret.code = 400
            ret.message = '参数错误'
            return ret
        }
        await goodModel().model().create(createRow)
        // Log.info(ctx.uuid, 'addGood().ret', ret)
        // ctx.result = ret
        return ret
    }
}
module.exports = new GoodService()