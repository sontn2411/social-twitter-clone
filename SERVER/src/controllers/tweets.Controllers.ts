import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { TweeRequestBody } from '~/models/requests/Tweet.reques'

export const crateTweetController = async (req: Request<ParamsDictionary, any, TweeRequestBody>, res: Response) => {
  return res.json('create tweet success')
}
