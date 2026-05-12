// import aws from 'aws-sdk'
import 'dotenv/config'
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand
} from '@aws-sdk/client-s3'
import path from 'path'
import multerConfig from '../config/multer'
import fs from 'fs'

class S3Storage {
  constructor() {
    this.client = new S3Client({ region: 'sa-east-1' })
  }

  async saveFile(file, response) {
    // const originalPath = path.resolve(multerConfig.directory, filename)
    // const contentType = (async () => {
    //   const mime = await import('mime')
    //   // use mime aqui
    //   mime.getType(originalPath)
    // })()

    // if (!contentType) {
    //   throw new Error('File not found')
    // }

    // const fileContent = await fs.promises.readFile(originalPath)

    const params = {
      Bucket: 'portifolio-img',
      Key: file.originalname,
      Body: file.buffer,
      ContentType: file.mimetype
    }

    try {
      await this.client.send(new PutObjectCommand(params))
    } catch (error) {
      return response.status(400).json({ Error: error })
    }
    // } finally {
    //   await fs.promises.unlink(originalPath)
    // }
  }
  //--------------------------------------------------------------
  async deleteFile(filename, response) {
    const params = {
      Bucket: 'portifolio-img',
      Key: filename
    }

    try {
      await this.client.send(new DeleteObjectCommand(params))
    } catch (error) {
      return response.status(400).json({ Error: error })
    }
  }
  //--------------------------------------------------------------
}

export default new S3Storage()
