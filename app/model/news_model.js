const Sequelize = require('sequelize')
const BaseModel = require('./base_model')

class NewsModel extends BaseModel {

  constructor() {
    super()

    let model = this.db().define('news', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true
      },
      title: {
        type: Sequelize.STRING(255)
      },
      description: {
        type: Sequelize.STRING(1000)
      },
      cover: {
        type: Sequelize.STRING(255)
      },
      content: {
        type: Sequelize.TEXT
      },
      post_time: {
        type: Sequelize.BIGINT(11),
        defaultValue: parseInt(Date.now() / 1000)
      },
      create_time: {
        type: Sequelize.BIGINT(11),
        defaultValue: parseInt(Date.now() / 1000)
      },
      update_time: {
        type: Sequelize.BIGINT(11),
        defaultValue: parseInt(Date.now() / 1000)
      },
      status: {
        type: Sequelize.INTEGER(2),
        defaultValue: 1
      },
      type: {
        type: Sequelize.INTEGER(2),
        defaultValue: 1
      },
      category: {
        type: Sequelize.STRING(12),
        defaultValue: ''
      },
      sort: {
        type: Sequelize.BIGINT(11),
        defaultValue: 0
      },
      admin_id: {
        type: Sequelize.BIGINT,
        defaultValue: 0
      }


    }, {
      timestamps: true,
      createdAt: 'create_time',
      updatedAt: 'update_time',
      freezeTableName: true,
      tableName: 't_news'
    })

    this._model = model
    return this
  }


}

module.exports = function () {
  return new NewsModel()
}