import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads')

export async function uploadFile(file: File): Promise<string> {
  const mode = process.env.UPLOAD_MODE || 'local'
  if (mode === 's3') return uploadToS3(file)
  return uploadLocal(file)
}

async function uploadLocal(file: File): Promise<string> {
  await mkdir(UPLOAD_DIR, { recursive: true })
  const ext = file.name.split('.').pop() || 'jpg'
  const filename = `${uuidv4()}.${ext}`
  const filepath = path.join(UPLOAD_DIR, filename)
  const bytes = await file.arrayBuffer()
  await writeFile(filepath, Buffer.from(bytes))
  return `/uploads/${filename}`
}

async function uploadToS3(file: File): Promise<string> {
  const endpoint = process.env.S3_ENDPOINT
  const bucket = process.env.S3_BUCKET
  const accessKey = process.env.S3_ACCESS_KEY
  const secretKey = process.env.S3_SECRET_KEY

  if (!endpoint || !bucket || !accessKey || !secretKey) {
    console.warn('S3 not configured, falling back to local')
    return uploadLocal(file)
  }

  const ext = file.name.split('.').pop() || 'jpg'
  const key = `uploads/${uuidv4()}.${ext}`
  const bytes = await file.arrayBuffer()
  const url = `${endpoint}/${bucket}/${key}`

  await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: bytes,
  })

  return url
}

export async function uploadMultipleFiles(files: File[]): Promise<string[]> {
  return Promise.all(files.map(uploadFile))
}
