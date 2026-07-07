const QRCode = require('qrcode');
const crypto = require('crypto');
const { addMinutes, isExpired } = require('../../utils/helpers');

const QR_EXPIRY_MINUTES = parseInt(process.env.QR_CODE_EXPIRES_MINUTES) || 15;

/**
 * Generate a signed QR payload for an attendance session.
 * The payload is HMAC-signed so it cannot be forged.
 */
const generateQRPayload = (sessionId, courseId) => {
  const expiresAt = addMinutes(new Date(), QR_EXPIRY_MINUTES);
  const nonce = crypto.randomBytes(16).toString('hex');

  const payload = { sessionId, courseId, expiresAt: expiresAt.toISOString(), nonce };
  const signature = crypto
    .createHmac('sha256', process.env.JWT_SECRET)
    .update(JSON.stringify(payload))
    .digest('hex');

  return { ...payload, signature };
};

const generateQRCode = async (sessionId, courseId) => {
  const payload = generateQRPayload(sessionId, courseId);
  const qrDataUrl = await QRCode.toDataURL(JSON.stringify(payload), {
    errorCorrectionLevel: 'H',
    width: 300,
    margin: 2,
    color: { dark: '#1E3A5F', light: '#FFFFFF' },
  });
  return { qrDataUrl, expiresAt: payload.expiresAt };
};

const verifyQRPayload = (rawPayload) => {
  let payload;
  try {
    payload = typeof rawPayload === 'string' ? JSON.parse(rawPayload) : rawPayload;
  } catch {
    throw Object.assign(new Error('Invalid QR code format'), { statusCode: 400 });
  }

  if (isExpired(payload.expiresAt)) {
    throw Object.assign(new Error('QR code has expired. Please refresh.'), { statusCode: 400 });
  }

  const { signature, ...data } = payload;
  const expectedSig = crypto
    .createHmac('sha256', process.env.JWT_SECRET)
    .update(JSON.stringify(data))
    .digest('hex');

  const supplied = Buffer.from(signature || '', 'hex');
  const expected = Buffer.from(expectedSig, 'hex');
  if (supplied.length !== expected.length || !crypto.timingSafeEqual(supplied, expected)) {
    throw Object.assign(new Error('Invalid QR code signature'), { statusCode: 400 });
  }

  return payload;
};

module.exports = { generateQRCode, verifyQRPayload };
