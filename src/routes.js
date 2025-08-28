import { Router } from 'express'

import multer from 'multer'
import multerConfing from './config/multer'
import authMiddlewares from './app/middlewares/auth'
import UserController from './app/controllers/UserController'
import CategoryController from './app/controllers/CategoryController'
import ProjectController from './app/controllers/ProjectController'
import SessionController from './app/controllers/SessionController'
import DataBase from './database/index'

const routes = new Router()
const upload = multer(multerConfing)

routes.get('/', (req, res) => {
  DataBase.connection
    .authenticate()
    .then(() => {
      return res.send(
        `🚀 Server started on port: ${process.env.PORT} <br/> <br/> 
        ✅ Connection to the database stablished successfully.`
      )
    })
    .catch(error => {
      return res.send(`❌ Error connecting to database: ${error}`)
    })
})

routes.post('/sessions', SessionController.store)
routes.post('/forgotPass', SessionController.forgotPass)
routes.patch('/resetPassword/:token', SessionController.resetPassword)

routes.get('/categories', CategoryController.index)

routes.get('/projects', ProjectController.index)

routes.post('/contact-form', UserController.contact)

routes.use(authMiddlewares)

routes.post('/categories', CategoryController.store)
routes.put('/categories/:id', CategoryController.update)
routes.delete('/categories/:id', CategoryController.delete)

routes.post('/projects', upload.single('file'), ProjectController.store)
routes.put('/projects/:id', upload.single('file'), ProjectController.update)
routes.delete('/projects/:id', ProjectController.delete)

routes.post('/users', UserController.store)
routes.patch('/users/:id', UserController.update)

export default routes
