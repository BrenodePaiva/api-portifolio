import Sequelize, { DataTypes, Model } from 'sequelize'

class Project extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        path: Sequelize.STRING,
        link: Sequelize.STRING,
        url: {
          type: Sequelize.VIRTUAL,
          get() {
            return `https://portifolio-image.s3.amazonaws.com/${this.path}`
          }
        },
        description: Sequelize.STRING,
        createdAt: {
          type: DataTypes.DATE,
          field: 'created_at'
        },
        updatedAt: {
          type: DataTypes.DATE,
          field: 'updated_at'
        }
      },
      { sequelize, tableName: 'projects' }
    )
    return this
  }

  static associate(model) {
    this.belongsTo(model.Category, {
      foreignKey: 'category_id',
      as: 'category'
    })
  }
}

export default Project
