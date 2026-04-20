'use server';

import { db } from '@/db';
import {
  studentKitData,
  otomotifData,
  pertanianData,
  emergencyInformation,
  userModuleSelections,
  tags,
} from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';

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
