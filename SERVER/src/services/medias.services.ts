import { Request } from 'express'
import fs from 'fs'
import sharp from 'sharp'
import { env } from '~/config/environment'
import { isProduction } from '~/constants/config'
import { MediaType } from '~/constants/enum'
import { UPLOAD_IMAGE_DIR } from '~/constants/upload'
import { Media } from '~/models/Others'
import { getNameFromFullName, handleUploadImage, handleUploadVideo } from '~/utils/file'

class MediasService {
  async handleUploadImage(req: Request) {
    const files = await handleUploadImage(req)
    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const newName = getNameFromFullName(file.newFilename)
        const newPath = UPLOAD_IMAGE_DIR + `/${newName}.jpg`
        await sharp(file.filepath).jpeg().toFile(newPath)
        fs.unlinkSync(file.filepath)
        return {
          url: isProduction
            ? `${env.HOST_PRODUCTION}/static/images/${newName}.jpg`
            : `http://localhost:4000/static/images/${newName}.jpg`,
          type: MediaType.Image
        }
      })
    )
    return result
  }
  async handleUploadVideo(req: Request) {
    const files = await handleUploadVideo(req)
    const { newFilename } = files[0]
    return {
      url: isProduction
        ? `${env.HOST_PRODUCTION}/static/videos/${newFilename}`
        : `http://localhost:4000/static/videos/${newFilename}`
    }
  }
}

const mediasService = new MediasService()

export default mediasService
