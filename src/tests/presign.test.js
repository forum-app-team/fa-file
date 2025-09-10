import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../app.js';

describe('File Service presign', () => {
  it('rejects unauthenticated', async () => {
    const res = await request(app).post('/files/presign').send({});
    expect(res.status).toBe(401);
  });

  it('returns 201 for valid request', async () => {
    const res = await request(app)
      .post('/files/presign')
      .set('Authorization', 'Bearer demo-123')
      .send({ filename: 'avatar.png', contentType: 'image/png', sizeBytes: 1000, category: 'profile' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('uploadUrl');
    expect(res.body).toHaveProperty('objectKey');
    expect(res.body).toHaveProperty('fileUrl');
  });

  it('rejects disallowed type', async () => {
    const res = await request(app)
      .post('/files/presign')
      .set('Authorization', 'Bearer demo-123')
      .send({ filename: 'doc.exe', contentType: 'application/octet-stream', sizeBytes: 1000, category: 'profile' });
    expect([415,422]).toContain(res.status);
  });
});

