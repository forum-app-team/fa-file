import { randomUUID } from 'crypto';
import { config } from '../config.js';

export function buildObjectKey(userId, category, filename) {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const ext = filename.split('.').pop() || '';
  const uuid = randomUUID();

  return `u/${userId}/${category}/${year}/${month}/${uuid}.${ext}`;
}

export function validateFile(category, sizeBytes, contentType) {
  const rules = {
    profile: {
      maxSize: 5 * 1024 * 1024, // 5MB
      allowedTypes: ['image/png', 'image/jpeg']
    },
    postAttachment: {
      maxSize: 20 * 1024 * 1024, // 20MB
      allowedTypes: ['image/png', 'image/jpeg', 'application/pdf', 'text/plain']
    }
  }

  const rule = rules[category];
  if (!rule) return { ok: false, reason: 'category'};
  if (sizeBytes > rule.maxSize) return { ok: false, reason: 'size'};
  if (!rule.allowedTypes.includes(contentType)) return { ok: false, reason: 'type'};

  return { ok: true };
}

export async function presignPutUrl({ key, contentType }) {
  const mockUrl = `https://mock-s3.local/put/${encodeURIComponent(key)}`;
  const fileUrl = `https://mock-cdn.local/${key}`;

  return {
    url: mockUrl,
    headers: {
      'Content-Type': contentType,
      'x-amz-server-side-encryption': 'AES256'
    },
    fileUrl
  }
}

// direct upload
export async function putObjectStream({ key, contentType, body }) {
  console.log(`Mock upload: ${key}, size: ${body.length} bytes`);

  return {
    fileUrl: `https://mock-cdn.local/${key}`
  }
}