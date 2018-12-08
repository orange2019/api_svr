const Sequelize = require('sequelize');
const BaseModel = require('./base_model');

class MallAdModel extends BaseModel {
    constructor() {
        super()
        let model = this.db().define('mall_ad', 
        {
          id: {
            type: Sequelize.BIGINT,
            primaryKey: true,
            autoIncrement: true
          },
          title: {
            type: Sequelize.STRING(60)
          },
          description: {
            type: Sequelize.STRING(255)
          },
          photo: {
            type: Sequelize.STRING(255)
          },
          link: {
            type: Sequelize.STRING(80)
          },
          status: {
            type: Sequelize.INTEGER(1),
            defaultValue: 0
          },
          sort: {
            type: Sequelize.BIGINT(11),
            defaultValue: 0
          },
          create_time: {
            type: Sequelize.BIGINT(11),
            defaultValue: parseInt(Date.now() / 1000)
          },
          update_time: {
            type: Sequelize.BIGINT(11),
            defaultValue: parseInt(Date.now() / 1000)
          },
    
        }, 
        {
          timestamps: true,
          createdAt: 'create_time',
          updatedAt: 'update_time',
          freezeTableName: true,
          tableName: 't_mall_ad'
        })
        this._model = model
        return this
    }
}

module.exports = function () {
    return new MallAdModel()
}