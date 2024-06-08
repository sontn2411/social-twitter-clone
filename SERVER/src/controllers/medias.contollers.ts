import { NextFunction, Request, Response } from 'express'
import path from 'path'
import { handleUploadImageSingle } from '~/utils/file'

console.log(path.resolve('uploads'))
export const uploadSingleImageController = async (req: Request, res: Response, next: NextFunction) => {
  const data = await handleUploadImageSingle(req)
  return res.json({
    result: data
  })
}
