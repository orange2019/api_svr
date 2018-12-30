const Sequelize = require('sequelize')
const BaseModel = require('./base_model')

class VideoModel extends BaseModel {

  constructor() {
    super()

    let model = this.db().define('video', {
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
        type: Sequelize.STRING(255),
        defaultValue: ''
      },
      url: {
        type: Sequelize.STRING(255),
        defaultValue: ''
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
      sort: {
        type: Sequelize.BIGINT(11),
        defaultValue: 0
      }


    }, {
      timestamps: true,
      createdAt: 'create_time',
      updatedAt: 'update_time',
      freezeTableName: true,
      tableName: 't_video'
    })

    this._model = model
    return this
  }


}

module.exports = function () {
  return new VideoModel()
}