import multer from 'multer'
import path, { extname } from 'path'
import { v4 } from 'uuid'

const tmpFolder = path.resolve(__dirname, '..', '..', 'tmp')

export default {
  directory: tmpFolder,
  storage: multer.diskStorage({
    destination: tmpFolder,
    filename: (request, file, callback) => {
      return callback(null, v4() + extname(file.originalname))
    }
  })
}
