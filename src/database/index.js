import 'dotenv/config'
import Sequelize from 'sequelize'
import 'pg'

import Category from '../app/models/Category'
import Project from '../app/models/Project'
import User from '../app/models/User'
import ConfigDataBase from '../config/database'

const models = [User, Category, Project]

class DataBase {
  constructor() {
    this.init()
  }

  init() {
    this.connection = new Sequelize(process.env.DB_URL,  ConfigDataBase )
    models
      .map(model => model.init(this.connection))
      .map(model => model.associate && model.associate(this.connection.models))

      console.log('Atributos do User:', Object.keys(User.rawAttributes))
  }
}

export default new DataBase()
