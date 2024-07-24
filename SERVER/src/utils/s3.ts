import * as AWS from '@aws-sdk/client-s3'
import fs from 'fs'
import { Upload } from '@aws-sdk/lib-storage'
import { env } from '~/config/environment'

const client = new AWS.S3({
  region: env.AWS_REGION,
  credentials: {
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY as string,
    accessKeyId: env.AWS_ACCESS_KEY_ID as string
  }
})

export const uploadFileToS3 = ({
  filename,
  filepath,
  contentType
}: {
  filename: string
  filepath: string
  contentType: string
}) => {
  const parallelUploads3 = new Upload({
    client: client,
    params: {
      Bucket: 'twitter-clone-phongphanq089',
      Key: filename,
      Body: fs.readFileSync(filepath),
      ContentType: contentType
    },

    // optional tags
    tags: [
      /*...*/
    ],

    queueSize: 4,

    partSize: 1024 * 1024 * 5,

    leavePartsOnError: false
  })

  parallelUploads3.on('httpUploadProgress', (progress) => {
    console.log(progress)
  })
  return parallelUploads3.done()
}

// parallelUploads3.done().then((data) => {
//   console.log(data)
// })
