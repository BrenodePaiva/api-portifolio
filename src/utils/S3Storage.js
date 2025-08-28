// import aws from 'aws-sdk'
import 'dotenv/config'
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand
} from '@aws-sdk/client-s3'
import path from 'path'
import multerConfig from '../config/multer'
import mime from 'mime'
import fs from 'fs'

class S3Storage {
  constructor() {
    this.client = new S3Client({ region: 'us-east-1' })
  }

  async saveFile(filename, response) {
    const originalPath = path.resolve(multerConfig.directory, filename)
    const contentType = mime.getType(originalPath)

    if (!contentType) {
      throw new Error('File not found')
    }

    const fileContent = await fs.promises.readFile(originalPath)

    const params = {
      Bucket: 'portifolio-image',
      Key: filename,
      Body: fileContent,
      ContentType: contentType
    }

    try {
      await this.client.send(new PutObjectCommand(params))
    } catch (error) {
      return response.status(400).json({ Error: error })
    } finally {
      await fs.promises.unlink(originalPath)
    }
  }
  //--------------------------------------------------------------
  async deleteFile(filename, response) {
    const params = {
      Bucket: 'portifolio-image',
      Key: filename
    }

    try {
      await this.client.send(new DeleteObjectCommand(params))
    } catch (error) {
      return response.status(400).json({ Error: error })
    }
  }
  //--------------------------------------------------------------
  // constructor() {
  //   this.client = new aws.S3({
  //     region: 'us-east-1'
  //   })
  // }
  // async saveFile(filename) {
  //   const originalPath = path.resolve(multerConfig.directory, filename)
  //   const ContentType = mime.getType(originalPath)

  //   if (!ContentType) {
  //     throw new Error('File not found')
  //   }

  //   const fileContent = await fs.promises.readFile(originalPath)

  //   this.client
  //     .putObject({
  //       Bucket: 'aula-youtube-01',
  //       Key: filename,
  //       ACL: 'public-read',
  //       Body: fileContent,
  //       ContentType
  //     })
  //     .promise()

  //   await fs.promises.unlink(originalPath)
  // }
}

export default new S3Storage()
