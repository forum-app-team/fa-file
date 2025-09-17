import { S3Client, PutObjectCommand, GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Upload } from '@aws-sdk/lib-storage';
import { config } from '../config.js';
import { randomUUID } from 'crypto';

let s3Client;
function getClient() {
  if (s3Client) return s3Client;
  s3Client = new S3Client({
    region: config.region,
    endpoint: config.endpoint || undefined,
    credentials: config.accessKeyId && config.secretAccessKey ? {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    } : undefined,
    forcePathStyle: !!config.endpoint, // needed for MinIO/localstack
  });
  return s3Client;
}

const ALLOWED = {
  profile: {
    max: 5 * 1024 * 1024,
    types: ['image/png', 'image/jpeg'],
  },
  postAttachment: {
    max: 20 * 1024 * 1024,
    types: ['image/png', 'image/jpeg', 'application/pdf', 'application/zip', 'application/x-zip-compressed'],
  },
};

export function validateFile(category, sizeBytes, contentType) {
  const rules = ALLOWED[category];
  if (!rules) return { ok: false, reason: 'category' };
  if (sizeBytes > rules.max) return { ok: false, reason: 'size' };
  if (!rules.types.includes(contentType)) return { ok: false, reason: 'type' };
  return { ok: true };
}

function sanitizeFilename(name) {
  const i = name.lastIndexOf('.');
  const ext = i >= 0 ? name.slice(i + 1).toLowerCase() : '';
  return ext.replace(/[^a-z0-9]/g, '') || 'bin';
}

export function buildObjectKey(userId, category, filename) {
  const now = new Date();
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
  const ext = sanitizeFilename(filename);
  const id = randomUUID();
  return `u/${userId}/${category}/${yyyy}/${mm}/${id}.${ext}`;
}

export async function presignPutUrl({ key, contentType }) {
  if (config.mockS3) {
    const fake = `${config.publicBaseUrl}/${key}`;
    return { url: `https://mock-s3.local/put/${encodeURIComponent(key)}`, headers: { 'Content-Type': contentType, 'x-amz-server-side-encryption': config.sse }, fileUrl: fake };
  }
  const client = getClient();
  const cmd = new PutObjectCommand({
    Bucket: config.bucket,
    Key: key,
    ContentType: contentType,
    ServerSideEncryption: config.sse,
  });
  const url = await getSignedUrl(client, cmd, { expiresIn: config.presignExpiresSeconds });
  const fileUrl = `${config.publicBaseUrl}/${key}`;
  return { url, headers: { 'Content-Type': contentType, 'x-amz-server-side-encryption': config.sse }, fileUrl };
}

export async function putObjectStream({ key, contentType, body }) {
  const client = getClient();
  if (config.mockS3) {
    // drain stream
    await new Promise((resolve, reject) => {
      body.on('error', reject);
      body.on('end', resolve);
      body.resume();
    });
    return { fileUrl: `${config.publicBaseUrl}/${key}` };
  }
  const upload = new Upload({
    client,
    params: {
      Bucket: config.bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
      ServerSideEncryption: config.sse,
    },
  });
  await upload.done();
  return { fileUrl: `${config.publicBaseUrl}/${key}` };
}

export async function getObjectMetadata(key) {
  if (config.mockS3) {
    // Mock metadata for development
    return {
      ContentLength: 1024,
      ContentType: 'image/png',
      LastModified: new Date(),
      ServerSideEncryption: config.sse,
    };
  }

  const client = getClient();
  const cmd = new HeadObjectCommand({
    Bucket: config.bucket,
    Key: key,
  });

  try {
    const response = await client.send(cmd);
    return {
      ContentLength: response.ContentLength,
      ContentType: response.ContentType,
      LastModified: response.LastModified,
      ServerSideEncryption: response.ServerSideEncryption,
    };
  } catch (error) {
    if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
      return null; // File not found
    }
    throw error;
  }
}

export async function presignGetUrl(key, expiresIn = 3600) {
  if (config.mockS3) {
    return `https://mock-s3.local/get/${encodeURIComponent(key)}?expires=${Date.now() + expiresIn * 1000}`;
  }

  const client = getClient();
  const cmd = new GetObjectCommand({
    Bucket: config.bucket,
    Key: key,
  });

  return await getSignedUrl(client, cmd, { expiresIn });
}

