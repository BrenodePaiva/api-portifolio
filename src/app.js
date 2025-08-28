import express from 'express'
import routes from './routes'

import cors from 'cors'
import './database'
import 'dotenv/config'

class App {
  constructor() {
    this.app = express()
    this.app.use(
      cors({
        origin: process.env.API_CONSUMER,
        methods: ['GET', 'POST', 'PATCH', 'PUT'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true
      })
    )
    this.middlewares()
    this.routes()
  }

  middlewares() {
    this.app.use(express.json())
  }

  routes() {
    this.app.use(routes)
  }
}

export default new App().app
