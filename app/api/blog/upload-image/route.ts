import { NextRequest, NextResponse } from "next/server";
import { uploadR2Object } from '@/lib/r2-storage';

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const blob = await uploadR2Object({
      key: `blog/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`,
      body: Buffer.from(await file.arrayBuffer()),
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
