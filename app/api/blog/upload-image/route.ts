import type { NextRequest} from "next/server";
import { NextResponse } from "next/server";
import { uploadR2Object } from '@/lib/r2-storage';
import { isAdmin } from '@/lib/admin';

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size === 0 || file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File must be between 1 byte and 5MB" }, { status: 400 });
    }

    const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
    if (!allowedTypes.has(file.type)) {
      return NextResponse.json({ error: "Only JPEG, PNG, and WebP images are allowed" }, { status: 400 });
    }

    const extension = file.name.toLowerCase().match(/\.[a-z0-9]+$/)?.[0];
    const expectedExtension = file.type === 'image/jpeg' ? '.jpg' : `.${file.type.slice('image/'.length)}`;
    if (!extension || (file.type === 'image/jpeg' ? !['.jpg', '.jpeg'].includes(extension) : extension !== expectedExtension)) {
      return NextResponse.json({ error: "File extension does not match its content type" }, { status: 400 });
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    const hasSignature = file.type === 'image/jpeg'
      ? bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
      : file.type === 'image/png'
        ? bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47
        : bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46;
    if (!hasSignature) {
      return NextResponse.json({ error: "File content does not match its declared type" }, { status: 400 });
    }

    const blob = await uploadR2Object({
      key: `blog/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`,
      body: Buffer.from(bytes),
      contentType: file.type,
    });

    return NextResponse.json({ url: blob.url });
  } catch (error: any) {
    console.error("Image upload error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload image" },
      { status: 500 }
    );
  }
}
