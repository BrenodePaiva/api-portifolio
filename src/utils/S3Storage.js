// import aws from 'aws-sdk'
import 'dotenv/config'
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand
} from '@aws-sdk/client-s3'

class S3Storage {
  constructor() {
    this.client = new S3Client({ region: 'sa-east-1' })
  }

  async saveFile(file, response) {
   
    const params = {
      Bucket: 'portifolio-img',
      Key: file.originalname,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read'
    }

    try {
      await this.client.send(new PutObjectCommand(params))
    } catch (error) {
      return response.status(400).json({ Error: error })
    }
    
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
