import { errors } from '../utils/errors.js';
import { buildObjectKey, presignPutUrl, validateFile, putObjectStream, getObjectMetadata, presignGetUrl } from '../services/s3.service.js';
import { config } from '../config.js';

export async function presign(req, res, next) {
  try {
    const { filename, contentType, sizeBytes, category } = req.validated;
    const userId = req.user.userId;

    const v = validateFile(category, sizeBytes, contentType);
    if (!v.ok) {
      if (v.reason === 'type') return next(errors.unsupported('Disallowed content type'));
      if (v.reason === 'size') return next(errors.tooLarge('File too large'));
      return next(errors.unprocessable('Invalid category'));
    }

    const key = buildObjectKey(userId, category, filename);
    const signed = await presignPutUrl({ key, contentType });
    const payload = {
      uploadMethod: 'PUT',
      uploadUrl: signed.url,
      headers: signed.headers,
      expiresInSeconds: config.presignExpiresSeconds,
      objectKey: key,
      fileUrl: signed.fileUrl,
    };
    res.status(201).json(payload);
  } catch (err) {
    next(err);
  }
}

export async function upload(req, res, next) {
  try {
    const { category } = req.body;
    const userId = req.user.userId;
    const file = req.file; // from multer
    if (!file) return next(errors.badRequest('Missing file')); 

    const v = validateFile(category, file.size, file.mimetype);
    if (!v.ok) {
      if (v.reason === 'type') return next(errors.unsupported('Disallowed content type'));
      if (v.reason === 'size') return next(errors.tooLarge('File too large'));
      return next(errors.unprocessable('Invalid category'));
    }

    const key = buildObjectKey(userId, category, file.originalname);
    const { fileUrl } = await putObjectStream({ key, contentType: file.mimetype, body: file.buffer });

    res.status(201).json({ fileUrl, objectKey: key, sizeBytes: file.size, contentType: file.mimetype });
  } catch (err) {
    next(err);
  }
}

export async function retrieve(req, res, next) {
  try {
    const { objectKey } = req.params;
    const userId = req.user.userId;

    // Validate object key format and ownership
    if (!objectKey || !objectKey.startsWith(`u/${userId}/`)) {
      return next(errors.forbidden('Access denied: You can only retrieve your own files'));
    }

    // Get file metadata from S3
    const metadata = await getObjectMetadata(objectKey);
    if (!metadata) {
      return next(errors.notFound('File not found'));
    }

    // Generate presigned GET URL (1 hour expiry)
    const downloadUrl = await presignGetUrl(objectKey, 3600);

    const response = {
      objectKey,
      metadata: {
        size: metadata.ContentLength,
        contentType: metadata.ContentType,
        lastModified: metadata.LastModified,
        serverSideEncryption: metadata.ServerSideEncryption,
      },
      downloadUrl,
      expiresInSeconds: 3600,
    };

    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

