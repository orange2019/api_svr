const Sequelize = require('sequelize')
const BaseModel = require('./base_model')

class TestModel extends BaseModel {

  constructor() {
    super()

    let model = this.db().define('contract_token', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true
      },
      address: {
        type: Sequelize.STRING(128),
        defaultValue: ''
      },
      private_key: {
        type: Sequelize.STRING(128),
        defaultValue: ''
      },
      contract_address: {
        type: Sequelize.STRING(128),
        defaultValue: ''
      }

    }, {
      timestamps: false,
      createdAt: false,
      updatedAt: false,
      freezeTableName: true,
      tableName: 't_contract_token'
    })

    this._model = model
    return this
  }

  async getData(){
    return await this.model().findById(1)
  }

  async update(params){
    let data = await this.getData()
    return await data.update(params)
  }

}

module.exports = function () {
  return new TestModel()
}