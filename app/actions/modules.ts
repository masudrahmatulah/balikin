'use server';

import { db } from '@/db';
import {
  studentKitData,
  otomotifData,
  pertanianData,
  emergencyInformation,
  userModuleSelections,
  tags,
  studentKitScheduleShares,
} from '@/db/schema';
import { eq, and, gt, or } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { nanoid } from 'nanoid';

/**
 * Helper function to get authenticated session
 */
async function getSession() {
  return await auth.api.getSession({
    headers: await headers(),
  });
}

/**
 * Helper function to check if user owns the tag
 */
async function verifyTagOwnership(tagId: string, userId: string): Promise<boolean> {
  const tag = await db.query.tags.findFirst({
    where: eq(tags.id, tagId),
  });

  return tag?.ownerId === userId;
}

// ============================================================================
// STUDENT KIT ACTIONS
// ============================================================================

export async function getStudentKitData() {
  const session = await getSession();

  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const data = await db.query.studentKitData.findFirst({
    where: eq(studentKitData.userId, session.user.id),
  });

  return data;
}

export async function updateStudentKit(data: {
  classSchedule?: string;
  assignmentDeadlines?: string;
  driveLinks?: string;
  ktmKrsPhotos?: string;
}) {
  const session = await getSession();

  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const existingData = await db.query.studentKitData.findFirst({
    where: eq(studentKitData.userId, session.user.id),
  });

  if (existingData) {
    // Update existing record
    await db
      .update(studentKitData)
      .set({
        ...(data.classSchedule !== undefined && { classSchedule: data.classSchedule }),
        ...(data.assignmentDeadlines !== undefined && {
          assignmentDeadlines: data.assignmentDeadlines,
        }),
        ...(data.driveLinks !== undefined && { driveLinks: data.driveLinks }),
        ...(data.ktmKrsPhotos !== undefined && { ktmKrsPhotos: data.ktmKrsPhotos }),
        updatedAt: new Date(),
      })
      .where(eq(studentKitData.userId, session.user.id));
  } else {
    // Create new record
    await db.insert(studentKitData).values({
      userId: session.user.id,
      classSchedule: data.classSchedule || '{}',
      assignmentDeadlines: data.assignmentDeadlines || '{}',
      driveLinks: data.driveLinks || '[]',
      ktmKrsPhotos: data.ktmKrsPhotos || '[]',
    });
  }

  return { success: true };
}

// ============================================================================
// OTOMOTIF ACTIONS
// ============================================================================

export async function getOtomotifData() {
  const session = await getSession();

  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const data = await db.query.otomotifData.findFirst({
    where: eq(otomotifData.userId, session.user.id),
  });

  return data;
}

export async function updateOtomotifData(data: {
  stnkNumber?: string;
  stnkExpiryDate?: Date;
  oilChangeSchedule?: string;
  serviceHistory?: string;
  insuranceNumber?: string;
  insuranceProvider?: string;
}) {
  const session = await getSession();

  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const existingData = await db.query.otomotifData.findFirst({
    where: eq(otomotifData.userId, session.user.id),
  });

  if (existingData) {
    await db
      .update(otomotifData)
      .set({
        ...(data.stnkNumber !== undefined && { stnkNumber: data.stnkNumber }),
        ...(data.stnkExpiryDate !== undefined && {
          stnkExpiryDate: data.stnkExpiryDate,
        }),
        ...(data.oilChangeSchedule !== undefined && {
          oilChangeSchedule: data.oilChangeSchedule,
        }),
        ...(data.serviceHistory !== undefined && { serviceHistory: data.serviceHistory }),
        ...(data.insuranceNumber !== undefined && {
          insuranceNumber: data.insuranceNumber,
        }),
        ...(data.insuranceProvider !== undefined && {
          insuranceProvider: data.insuranceProvider,
        }),
        updatedAt: new Date(),
      })
      .where(eq(otomotifData.userId, session.user.id));
  } else {
    await db.insert(otomotifData).values({
      userId: session.user.id,
      stnkNumber: data.stnkNumber || '',
      stnkExpiryDate: data.stnkExpiryDate || null,
      oilChangeSchedule: data.oilChangeSchedule || '[]',
      serviceHistory: data.serviceHistory || '[]',
      insuranceNumber: data.insuranceNumber || '',
      insuranceProvider: data.insuranceProvider || '',
    });
  }

  return { success: true };
}

// ============================================================================
// PERTANIAN ACTIONS
// ============================================================================

export async function getPertanianData() {
  const session = await getSession();

  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const data = await db.query.pertanianData.findFirst({
    where: eq(pertanianData.userId, session.user.id),
  });

  return data;
}

export async function updatePertanianData(data: {
  hstCalculator?: string;
  fertilizerSchedule?: string;
  harvestLog?: string;
  laborCostNotes?: string;
}) {
  const session = await getSession();

  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const existingData = await db.query.pertanianData.findFirst({
    where: eq(pertanianData.userId, session.user.id),
  });

  if (existingData) {
    await db
      .update(pertanianData)
      .set({
        ...(data.hstCalculator !== undefined && { hstCalculator: data.hstCalculator }),
        ...(data.fertilizerSchedule !== undefined && {
          fertilizerSchedule: data.fertilizerSchedule,
        }),
        ...(data.harvestLog !== undefined && { harvestLog: data.harvestLog }),
        ...(data.laborCostNotes !== undefined && {
          laborCostNotes: data.laborCostNotes,
        }),
        updatedAt: new Date(),
      })
      .where(eq(pertanianData.userId, session.user.id));
  } else {
    await db.insert(pertanianData).values({
      userId: session.user.id,
      hstCalculator: data.hstCalculator || '{}',
      fertilizerSchedule: data.fertilizerSchedule || '[]',
      harvestLog: data.harvestLog || '[]',
      laborCostNotes: data.laborCostNotes || '[]',
    });
  }

  return { success: true };
}

// ============================================================================
// EMERGENCY INFORMATION ACTIONS (TAB 1)
// ============================================================================

export async function getEmergencyInformation(tagId: string) {
  const data = await db.query.emergencyInformation.findFirst({
    where: eq(emergencyInformation.tagId, tagId),
  });

  return data;
}

export async function updateEmergencyInformation(tagId: string, data: {
  bloodType?: string;
  allergies?: string;
  medicalConditions?: string;
  emergencyContact?: string;
  emergencyContactName?: string;
}) {
  const session = await getSession();

  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  // Verify ownership
  const isOwner = await verifyTagOwnership(tagId, session.user.id);
  if (!isOwner) {
    throw new Error('Forbidden: You do not own this tag');
  }

  const existingData = await db.query.emergencyInformation.findFirst({
    where: eq(emergencyInformation.tagId, tagId),
  });

  if (existingData) {
    await db
      .update(emergencyInformation)
      .set({
        ...(data.bloodType !== undefined && { bloodType: data.bloodType }),
        ...(data.allergies !== undefined && { allergies: data.allergies }),
        ...(data.medicalConditions !== undefined && {
          medicalConditions: data.medicalConditions,
        }),
        ...(data.emergencyContact !== undefined && {
          emergencyContact: data.emergencyContact,
        }),
        ...(data.emergencyContactName !== undefined && {
          emergencyContactName: data.emergencyContactName,
        }),
        updatedAt: new Date(),
      })
      .where(eq(emergencyInformation.tagId, tagId));
  } else {
    await db.insert(emergencyInformation).values({
      tagId,
      bloodType: data.bloodType || '',
      allergies: data.allergies || '',
      medicalConditions: data.medicalConditions || '',
      emergencyContact: data.emergencyContact || '',
      emergencyContactName: data.emergencyContactName || '',
    });
  }

  // Revalidate the public page to show updated emergency info
  revalidatePath(`/p/[slug]`);

  return { success: true };
}

// ============================================================================
// MODULE SELECTION ACTIONS
// ============================================================================

export async function getUserModuleSelections() {
  const session = await getSession();

  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const selections = await db.query.userModuleSelections.findMany({
    where: and(
      eq(userModuleSelections.userId, session.user.id),
      eq(userModuleSelections.isActive, true)
    ),
  });

  return selections;
}

export async function setUserModuleSelections(moduleTypes: string[]) {
  const session = await getSession();

  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  // Deactivate all existing selections
  await db
    .update(userModuleSelections)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(userModuleSelections.userId, session.user.id));

  // Add or reactivate selected modules
  for (const moduleType of moduleTypes) {
    const existing = await db.query.userModuleSelections.findFirst({
      where: and(
        eq(userModuleSelections.userId, session.user.id),
        eq(userModuleSelections.moduleType, moduleType)
      ),
    });

    if (existing) {
      await db
        .update(userModuleSelections)
        .set({ isActive: true, updatedAt: new Date() })
        .where(eq(userModuleSelections.id, existing.id));
    } else {
      await db.insert(userModuleSelections).values({
        userId: session.user.id,
        moduleType,
        isActive: true,
      });
    }
  }

  return { success: true };
}

export async function enableTabTwo(tagId: string) {
  const session = await getSession();

  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  // Verify ownership
  const isOwner = await verifyTagOwnership(tagId, session.user.id);
  if (!isOwner) {
    throw new Error('Forbidden: You do not own this tag');
  }

  await db
    .update(tags)
    .set({ hasTabTwoEnabled: true })
    .where(eq(tags.id, tagId));

  revalidatePath(`/p/[slug]`);

  return { success: true };
}

// ============================================================================
// SCHEDULE SHARING ACTIONS
// ============================================================================

/**
 * Generate a share code for the current user's schedule
 * Creates a new share record that expires in 7 days
 */
export async function shareSchedule() {
  const session = await getSession();

  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  // Get current student kit data
  const studentData = await db.query.studentKitData.findFirst({
    where: eq(studentKitData.userId, session.user.id),
  });

  if (!studentData || !studentData.classSchedule) {
    throw new Error('Tidak ada data jadwal untuk dibagikan');
  }

  // Generate unique share code
  const shareCode = nanoid(10); // 10-character unique code

  // Calculate expiry date (7 days from now)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  // Create share record
  await db.insert(studentKitScheduleShares).values({
    userId: session.user.id,
    shareCode,
    classSchedule: studentData.classSchedule,
    assignmentDeadlines: studentData.assignmentDeadlines || '{}',
    driveLinks: studentData.driveLinks || '[]',
    expiresAt,
  });

  return {
    success: true,
    shareCode,
    expiresAt: expiresAt.toISOString(),
  };
}

/**
 * Retrieve schedule by share code
 * Used for importing shared schedules
 */
export async function getScheduleByShareCode(shareCode: string) {
  const share = await db.query.studentKitScheduleShares.findFirst({
    where: eq(studentKitScheduleShares.shareCode, shareCode),
  });

  if (!share) {
    throw new Error('Kode berbagi tidak valid atau sudah kadaluarsa');
  }

  // Check if expired
  if (share.expiresAt < new Date()) {
    throw new Error('Kode berbagi sudah kadaluarsa');
  }

  return {
    classSchedule: share.classSchedule,
    assignmentDeadlines: share.assignmentDeadlines,
    driveLinks: share.driveLinks,
  };
}

/**
 * Import schedule from share code to current user's account
 */
export async function importSchedule(shareCode: string) {
  const session = await getSession();

  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  // Get the shared schedule
  const sharedData = await getScheduleByShareCode(shareCode);

  // Get existing student data
  const existingData = await db.query.studentKitData.findFirst({
    where: eq(studentKitData.userId, session.user.id),
  });

  if (existingData) {
    // Update existing record with shared data
    await db
      .update(studentKitData)
      .set({
        classSchedule: sharedData.classSchedule,
        assignmentDeadlines: sharedData.assignmentDeadlines,
        driveLinks: sharedData.driveLinks,
        updatedAt: new Date(),
      })
      .where(eq(studentKitData.userId, session.user.id));
  } else {
    // Create new record with shared data
    await db.insert(studentKitData).values({
      userId: session.user.id,
      classSchedule: sharedData.classSchedule,
      assignmentDeadlines: sharedData.assignmentDeadlines,
      driveLinks: sharedData.driveLinks,
      ktmKrsPhotos: '[]',
    });
  }

  revalidatePath('/p/[slug]/private/student');

  return { success: true };
}

// ============================================================================
// VCARD ACTIONS
// ============================================================================

/**
 * Update vCard data for the current user
 */
export async function updateInternshipVCard(data: {
  fullName?: string;
  title?: string;
  email?: string;
  phone?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  githubUrl?: string;
  bio?: string;
}) {
  const session = await getSession();

  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  // Get existing data
  const existingData = await db.query.studentKitData.findFirst({
    where: eq(studentKitData.userId, session.user.id),
  });

  // Parse existing vCard data
  const existingVCard = existingData?.vcardData
    ? JSON.parse(existingData.vcardData)
    : {};

  // Merge with new data
  const updatedVCard = {
    ...existingVCard,
    ...data,
  };

  // Generate unique share code if not exists
  let vcardShareCode = existingData?.vcardShareCode;
  if (!vcardShareCode && data.fullName) {
    vcardShareCode = nanoid(10);
  }

  if (existingData) {
    // Update existing record
    await db
      .update(studentKitData)
      .set({
        vcardData: JSON.stringify(updatedVCard),
        ...(vcardShareCode && { vcardShareCode }),
        updatedAt: new Date(),
      })
      .where(eq(studentKitData.userId, session.user.id));
  } else {
    // Create new record
    await db.insert(studentKitData).values({
      userId: session.user.id,
      classSchedule: '{}',
      assignmentDeadlines: '{}',
      driveLinks: '[]',
      ktmKrsPhotos: '[]',
      vcardData: JSON.stringify(updatedVCard),
      vcardShareCode,
    });
  }

  revalidatePath('/p/[slug]/private/student');

  return {
    success: true,
    shareCode: vcardShareCode,
  };
}

/**
 * Get vCard data by share code
 * Used for public vCard page
 */
export async function getVCardByShareCode(shareCode: string) {
  const vcardData = await db.query.studentKitData.findFirst({
    where: eq(studentKitData.vcardShareCode, shareCode),
  });

  if (!vcardData || !vcardData.vcardData) {
    throw new Error('vCard tidak ditemukan');
  }

  return {
    vcardData: JSON.parse(vcardData.vcardData),
    shareCode: vcardData.vcardShareCode,
  };
}

// ============================================================================
// NOTIFICATION SETTINGS ACTIONS
// ============================================================================

/**
 * Update WhatsApp notification preferences for deadline reminders
 */
export async function updateStudentKitNotificationSettings(data: {
  whatsappNotificationsEnabled?: boolean;
  notificationPhoneNumber?: string;
}) {
  const session = await getSession();

  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  // Get existing data
  const existingData = await db.query.studentKitData.findFirst({
    where: eq(studentKitData.userId, session.user.id),
  });

  if (existingData) {
    // Update existing record
    await db
      .update(studentKitData)
      .set({
        ...(data.whatsappNotificationsEnabled !== undefined && {
          whatsappNotificationsEnabled: data.whatsappNotificationsEnabled,
        }),
        ...(data.notificationPhoneNumber !== undefined && {
          notificationPhoneNumber: data.notificationPhoneNumber,
        }),
        updatedAt: new Date(),
      })
      .where(eq(studentKitData.userId, session.user.id));
  } else {
    // Create new record with notification settings
    await db.insert(studentKitData).values({
      userId: session.user.id,
      classSchedule: '{}',
      assignmentDeadlines: '{}',
      driveLinks: '[]',
      ktmKrsPhotos: '[]',
      whatsappNotificationsEnabled: data.whatsappNotificationsEnabled || false,
      notificationPhoneNumber: data.notificationPhoneNumber || null,
    });
  }

  return { success: true };
}
