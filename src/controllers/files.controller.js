import { buildObjectKey, presignPutUrl, validateFile, putObjectStream } from '../services/s3.service.js';

export async function presign(req, res, next) {
  try {
    const { filename, contentType, sizeBytes, category } = req.body;
    const userId = req.user.userId;

    if (!filename || !contentType || !sizeBytes || !category) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const validation = validateFile(category, sizeBytes, contentType);
    if (!validation.ok) {
      const statusCode = validation.reason === 'size' ? 413 : 415;
      return res.status(statusCode).json({ error: `Invalid file ${validation.reason}` });
    }

    const key = buildObjectKey(userId, category, filename);
    const signed = await presignPutUrl({ key, contentType });

    const response = {
      uploadMethod: 'PUT',
      uploadUrl: signed.url,
      headers: signed.headers,
      expiresInSeconds: 600,
      objectKey: key,
      fileUrl: signed.fileUrl,
    };

    res.status(201).json(response);

  }
  catch (err) {
    next(err);
  }
}

// direct upload
export async function upload(req, res, next) {
  try {
    const { category } = req.body;
    const userId = req.user.userId;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'Missing file'});
    }

    if (!category) {
      return res.status(400).json({ error: 'Missing category' });
    }

    const validation = validateFile(category, file.size, file.mimetype);
    if(!validation.ok) {
      const statusCode = validation.reason === 'size' ? 413: 415;
      return res.status(statusCode).json({ error: `Invalid ${validation.reason}`});
    }

    const key = buildObjectKey(userId, category, file.originalname);
    const { fileUrl } = await putObjectStream({
      key,
      contentType: file.mimetype,
      body: file.buffer
    });

    res.status(201).json({
      fileUrl,
      objectKey: key,
      sizeBytes: file.size,
      contentType: file.mimetype
    });
  }
  catch(err) {
    next(err);
  }

}