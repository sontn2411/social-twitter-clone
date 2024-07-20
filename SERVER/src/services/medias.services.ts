import { CompleteMultipartUploadCommandOutput } from '@aws-sdk/client-s3'
import { Request } from 'express'
import fs from 'fs'
import fsPromise from 'fs/promises'
import path from 'path'
import sharp from 'sharp'
import { env } from '~/config/environment'
import { isProduction } from '~/constants/config'
import { MediaType } from '~/constants/enum'
import { UPLOAD_IMAGE_DIR } from '~/constants/upload'
import { Media } from '~/models/Others'
import { getNameFromFullName, handleUploadImage, handleUploadVideo } from '~/utils/file'
import { uploadFileToS3 } from '~/utils/s3'

class MediasService {
  async handleUploadImage(req: Request) {
    const files = await handleUploadImage(req)
    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const newName = getNameFromFullName(file.newFilename)
        const newFullFilename = `${newName}.jpg`
        const mime = (await import('mime')).default
        const newPath = path.resolve(UPLOAD_IMAGE_DIR, newFullFilename)
        await sharp(file.filepath).jpeg().toFile(newPath)
        const s3Result = await uploadFileToS3({
          filename: 'images/' + newFullFilename,
          filepath: newPath,
          contentType: mime.getType(newPath) as string
        })
        console.log('Image uploaded to S3:', s3Result)
        await Promise.all([fsPromise.unlink(file.filepath), fsPromise.unlink(newPath)])

        return {
          url: (s3Result as CompleteMultipartUploadCommandOutput).Location as string,
          type: MediaType.Image
        }
        // return {
        //   url: isProduction
        //     ? `${env.HOST_PRODUCTION}/static/images/${newName}.jpg`
        //     : `http://localhost:4000/static/images/${newName}.jpg`,
        //   type: MediaType.Image
        // }
      })
    )
    return result
  }
  async handleUploadVideo(req: Request) {
    const files = await handleUploadVideo(req)
    const { newFilename } = files[0]

    const mime = (await import('mime')).default
    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        console.log(file, 'tải video 2379843274892')
        const s3Result = await uploadFileToS3({
          filename: 'videos/' + file.newFilename,
          contentType: mime.getType(file.filepath) as string,
          filepath: file.filepath
        })
        // fs.unlinkSync(file.filepath)

        return {
          url: (s3Result as CompleteMultipartUploadCommandOutput).Location as string,
          type: MediaType.Video
        }
        // return {
        //   url: isProduction
        //     ? `${env.HOST_PRODUCTION}/static/videos/${newFilename}`
        //     : `http://localhost:4000/static/videos/${newFilename}`
        // }
      })
    )
    return result
  }
}

const mediasService = new MediasService()

export default mediasService
