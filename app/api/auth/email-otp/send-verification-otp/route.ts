import { NextRequest, NextResponse } from "next/server";
import { sendWhatsAppOTP } from "@/lib/whatsapp";
import { db } from "@/db";
import { verification } from "@/db/schema";
import { eq } from "drizzle-orm";

// Helper functions
function isWhatsAppIdentifier(email: string): boolean {
  return email.endsWith('@wa.dev');
}

function extractPhoneNumber(email: string): string {
  return email.replace(/@wa\.dev$/, '');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, type } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Check if this is a WhatsApp identifier
    if (isWhatsAppIdentifier(email)) {
      const phoneNumber = extractPhoneNumber(email);
      console.log(`[WHATSAPP AUTH OTP] type=${type} phone=${phoneNumber} otp=${otp}`);

      await sendWhatsAppOTP({
        phoneNumber,
        otp,
        type: type as 'sign-in' | 'email-verification' | 'forget-password',
      });
    } else {
      console.log(`[EMAIL AUTH OTP] type=${type} email=${email} otp=${otp}`);
      // TODO: Implement email sending if needed
      // await sendOTPEmail({ email, otp, type: type as any });
    }

    // Store OTP in database with 5 minutes expiration
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Delete any existing OTP for this identifier
    await db.delete(verification).where(eq(verification.identifier, email));

    // Insert new OTP with generated ID
    await db.insert(verification).values({
      id: crypto.randomUUID(),
      identifier: email,
      value: otp,
      expiresAt,
    });

    console.log(`[OTP SAVED] identifier=${email} otp=${otp} expires=${expiresAt.toISOString()}`);

    // For development, return OTP in response
    // In production, remove this!
    if (process.env.NODE_ENV !== 'production') {
      return NextResponse.json({
        success: true,
        message: "OTP sent successfully",
        otp // Only for development!
      });
    }

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully"
    });
  } catch (error: any) {
    console.error("Error sending OTP:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send OTP" },
      { status: 500 }
    );
  }
}
