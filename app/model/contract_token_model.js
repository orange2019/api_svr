const Sequelize = require('sequelize')
const BaseModel = require('./base_model')
const defaultContractId = require('./../../config').default_contract_id

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

  async getData(id) {
    id = id || defaultContractId
    return await this.model().findById(id)
  }

  async update(params, id = 1) {
    let data = await this.getData(id)
    if (!data) {
      data = await this.model().create(params)
      return data
    }
    return await data.update(params)
  }

}

module.exports = function () {
  return new TestModel()
}