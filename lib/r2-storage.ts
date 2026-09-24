import {
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const endpoint = () => `https://${required('R2_ACCOUNT_ID')}.r2.cloudflarestorage.com`;

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} environment variable is not set`);
  return value;
}

function client() {
  return new S3Client({
    region: 'auto',
    endpoint: endpoint(),
    credentials: {
      accessKeyId: required('R2_ACCESS_KEY_ID'),
      secretAccessKey: required('R2_SECRET_ACCESS_KEY'),
    },
  });
}

function publicUrl(key: string): string {
  return `${required('R2_PUBLIC_URL').replace(/\/$/, '')}/${key}`;
}

export async function uploadR2Object(options: {
  key: string;
  body: Buffer | Uint8Array;
  contentType: string;
  privateObject?: boolean;
  expiresInSeconds?: number;
}): Promise<{ url: string; key: string; size: number }> {
  const bucket = required(options.privateObject ? 'R2_PRIVATE_BUCKET' : 'R2_PUBLIC_BUCKET');
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: options.key,
    Body: options.body,
    ContentType: options.contentType,
  });

  await client().send(command);

  const url = options.privateObject
    ? await getSignedUrl(client(), new GetObjectCommand({ Bucket: bucket, Key: options.key }), { expiresIn: Math.min(options.expiresInSeconds || 60 * 60 * 24 * 7, 60 * 60 * 24 * 7) })
    : publicUrl(options.key);

  return { url, key: options.key, size: options.body.byteLength };
}

export async function deleteR2Object(key: string, privateObject = false): Promise<void> {
  const bucket = required(privateObject ? 'R2_PRIVATE_BUCKET' : 'R2_PUBLIC_BUCKET');
  await client().send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}

export async function listR2Objects(prefix: string, privateObject = true): Promise<string[]> {
  const bucket = required(privateObject ? 'R2_PRIVATE_BUCKET' : 'R2_PUBLIC_BUCKET');
  const result = await client().send(new ListObjectsV2Command({ Bucket: bucket, Prefix: prefix }));
  return (result.Contents || []).flatMap((object) => object.Key ? [object.Key] : []);
}

export function r2Configured(): boolean {
  return Boolean(
    process.env.R2_ACCOUNT_ID &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    process.env.R2_PUBLIC_BUCKET &&
    process.env.R2_PRIVATE_BUCKET &&
    process.env.R2_PUBLIC_URL,
  );
}
