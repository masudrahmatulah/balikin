'use server';

import { db } from '@/db';
import {
  otomotifData,
  pertanianData,
  emergencyInformation,
  userModuleSelections,
  tags,
} from '@/db/schema';
import { eq, and, desc, inArray } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import {
  getStudentKitData as secureGetStudentKitData,
  updateStudentKit as secureUpdateStudentKit,
  shareSchedule as secureShareSchedule,
  getScheduleByShareCode as secureGetScheduleByShareCode,
  importSchedule as secureImportSchedule,
  updateInternshipVCard as secureUpdateInternshipVCard,
  getVCardByShareCode as secureGetVCardByShareCode,
  updateStudentKitNotificationSettings as secureUpdateStudentKitNotificationSettings,
} from './student-kit-actions';

// ============================================================================
// CONSTANTS
// ============================================================================

const TAG_ID_REGEX = /^[a-zA-Z0-9_-]{10,50}$/;
const SHARE_CODE_REGEX = /^[a-zA-Z0-9_-]{8,20}$/;
const MAX_MODULE_TYPES = 10;
const DEFAULT_EMPTY_JSON = '{}';
const DEFAULT_EMPTY_ARRAY = '[]';
const MODULE_UPDATE_FIELDS = {
  otomotif: ['stnkNumber', 'stnkExpiryDate', 'oilChangeSchedule', 'serviceHistory', 'insuranceNumber', 'insuranceProvider'] as const,
  pertanian: ['hstCalculator', 'fertilizerSchedule', 'harvestLog', 'laborCostNotes'] as const,
  emergency: ['bloodType', 'allergies', 'medicalConditions', 'emergencyContact', 'emergencyContactName'] as const,
} as const;

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

function validateTagId(tagId: string): boolean {
  return TAG_ID_REGEX.test(tagId);
}

function validateShareCode(shareCode: string): boolean {
  return SHARE_CODE_REGEX.test(shareCode);
}

function validateModuleTypes(moduleTypes: string[]): boolean {
  if (!Array.isArray(moduleTypes) || moduleTypes.length > MAX_MODULE_TYPES) {
    return false;
  }
  return moduleTypes.every(m => typeof m === 'string' && m.length > 0 && m.length <= 50);
}

// ============================================================================
// SESSION HELPERS
// ============================================================================

async function getSession() {
  return await auth.api.getSession({
    headers: await headers(),
  });
}

async function requireUserId(): Promise<string> {
  const session = await getSession();

  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  return session.user.id;
}

async function verifyTagOwnership(tagId: string, userId: string): Promise<boolean> {
  if (!validateTagId(tagId)) {
    return false;
  }

  const tag = await db.query.tags.findFirst({
    where: eq(tags.id, tagId),
    columns: { ownerId: true },
  });

  return tag?.ownerId === userId;
}

// ============================================================================
// STUDENT KIT ACTIONS (SECURE - Delegating to student-kit-actions.ts)
// ============================================================================

export async function getStudentKitData() {
  return secureGetStudentKitData();
}

export async function updateStudentKit(data: {
  classSchedule?: string;
  assignmentDeadlines?: string;
  driveLinks?: string;
  ktmKrsPhotos?: string;
}) {
  return secureUpdateStudentKit(data);
}

export async function shareSchedule() {
  return secureShareSchedule();
}

export async function getScheduleByShareCode(shareCode: string) {
  return secureGetScheduleByShareCode(shareCode);
}

export async function importSchedule(shareCode: string) {
  return secureImportSchedule(shareCode);
}

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
  return secureUpdateInternshipVCard(data);
}

export async function getVCardByShareCode(shareCode: string) {
  return secureGetVCardByShareCode(shareCode);
}

export async function updateStudentKitNotificationSettings(data: {
  whatsappNotificationsEnabled?: boolean;
  notificationPhoneNumber?: string;
}) {
  return secureUpdateStudentKitNotificationSettings(data);
}

// ============================================================================
// OTOMOTIF ACTIONS
// ============================================================================

export async function getOtomotifData() {
  const userId = await requireUserId();

  return db.query.otomotifData.findFirst({
    where: eq(otomotifData.userId, userId),
  });
}

export async function updateOtomotifData(data: {
  stnkNumber?: string;
  stnkExpiryDate?: Date;
  oilChangeSchedule?: string;
  serviceHistory?: string;
  insuranceNumber?: string;
  insuranceProvider?: string;
}) {
  const userId = await requireUserId();

  const existingData = await db.query.otomotifData.findFirst({
    where: eq(otomotifData.userId, userId),
    columns: { id: true },
  });

  const updateValues: Record<string, unknown> = {
    updatedAt: new Date(),
  };

  for (const field of MODULE_UPDATE_FIELDS.otomotif) {
    if (data[field] !== undefined) {
      updateValues[field] = data[field];
    }
  }

  if (existingData) {
    await db
      .update(otomotifData)
      .set(updateValues)
      .where(eq(otomotifData.id, existingData.id));
  } else {
    await db.insert(otomotifData).values({
      userId,
      stnkNumber: data.stnkNumber || '',
      stnkExpiryDate: data.stnkExpiryDate || null,
      oilChangeSchedule: data.oilChangeSchedule || DEFAULT_EMPTY_ARRAY,
      serviceHistory: data.serviceHistory || DEFAULT_EMPTY_ARRAY,
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
  const userId = await requireUserId();

  return db.query.pertanianData.findFirst({
    where: eq(pertanianData.userId, userId),
  });
}

export async function updatePertanianData(data: {
  hstCalculator?: string;
  fertilizerSchedule?: string;
  harvestLog?: string;
  laborCostNotes?: string;
}) {
  const userId = await requireUserId();

  const existingData = await db.query.pertanianData.findFirst({
    where: eq(pertanianData.userId, userId),
    columns: { id: true },
  });

  const updateValues: Record<string, unknown> = {
    updatedAt: new Date(),
  };

  for (const field of MODULE_UPDATE_FIELDS.pertanian) {
    if (data[field] !== undefined) {
      updateValues[field] = data[field];
    }
  }

  if (existingData) {
    await db
      .update(pertanianData)
      .set(updateValues)
      .where(eq(pertanianData.id, existingData.id));
  } else {
    await db.insert(pertanianData).values({
      userId,
      hstCalculator: data.hstCalculator || DEFAULT_EMPTY_JSON,
      fertilizerSchedule: data.fertilizerSchedule || DEFAULT_EMPTY_ARRAY,
      harvestLog: data.harvestLog || DEFAULT_EMPTY_ARRAY,
      laborCostNotes: data.laborCostNotes || DEFAULT_EMPTY_ARRAY,
    });
  }

  return { success: true };
}

// ============================================================================
// EMERGENCY INFORMATION ACTIONS (TAB 1)
// ============================================================================

export async function getEmergencyInformation(tagId: string) {
  if (!validateTagId(tagId)) {
    throw new Error('Invalid tag ID');
  }

  return db.query.emergencyInformation.findFirst({
    where: eq(emergencyInformation.tagId, tagId),
  });
}

export async function updateEmergencyInformation(tagId: string, data: {
  bloodType?: string;
  allergies?: string;
  medicalConditions?: string;
  emergencyContact?: string;
  emergencyContactName?: string;
}) {
  if (!validateTagId(tagId)) {
    throw new Error('Invalid tag ID');
  }

  const userId = await requireUserId();
  const isOwner = await verifyTagOwnership(tagId, userId);

  if (!isOwner) {
    throw new Error('Forbidden: You do not own this tag');
  }

  const existingData = await db.query.emergencyInformation.findFirst({
    where: eq(emergencyInformation.tagId, tagId),
    columns: { id: true },
  });

  const updateValues: Record<string, unknown> = {
    updatedAt: new Date(),
  };

  for (const field of MODULE_UPDATE_FIELDS.emergency) {
    if (data[field] !== undefined) {
      updateValues[field] = data[field];
    }
  }

  if (existingData) {
    await db
      .update(emergencyInformation)
      .set(updateValues)
      .where(eq(emergencyInformation.id, existingData.id));
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

  revalidatePath(`/p/[slug]`);

  return { success: true };
}

// ============================================================================
// MODULE SELECTION ACTIONS
// ============================================================================

export async function getUserModuleSelections() {
  const userId = await requireUserId();

  return db.query.userModuleSelections.findMany({
    where: and(
      eq(userModuleSelections.userId, userId),
      eq(userModuleSelections.isActive, true)
    ),
  });
}

export async function setUserModuleSelections(moduleTypes: string[]) {
  const userId = await requireUserId();

  if (!validateModuleTypes(moduleTypes)) {
    throw new Error('Invalid module types');
  }

  await db.transaction(async (tx) => {
    await tx
      .update(userModuleSelections)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(userModuleSelections.userId, userId));

    if (moduleTypes.length === 0) {
      return;
    }

    const existingSelections = await tx.query.userModuleSelections.findMany({
      where: and(
        eq(userModuleSelections.userId, userId),
        inArray(userModuleSelections.moduleType, moduleTypes)
      ),
      columns: { id: true, moduleType: true },
    });

    const existingModuleTypes = new Set(existingSelections.map(s => s.moduleType));
    const modulesToCreate: string[] = [];
    const modulesToUpdate: Array<{ id: string }> = [];

    for (const moduleType of moduleTypes) {
      const existing = existingSelections.find(s => s.moduleType === moduleType);
      if (existing) {
        modulesToUpdate.push({ id: existing.id });
      } else {
        modulesToCreate.push(moduleType);
      }
    }

    if (modulesToUpdate.length > 0) {
      await tx
        .update(userModuleSelections)
        .set({ isActive: true, updatedAt: new Date() })
        .where(inArray(
          userModuleSelections.id,
          modulesToUpdate.map(m => m.id)
        ));
    }

    if (modulesToCreate.length > 0) {
      await tx.insert(userModuleSelections).values(
        modulesToCreate.map(moduleType => ({
          userId,
          moduleType,
          isActive: true,
        }))
      );
    }
  });

  return { success: true };
}

export async function enableTabTwo(tagId: string) {
  if (!validateTagId(tagId)) {
    throw new Error('Invalid tag ID');
  }

  const userId = await requireUserId();
  const isOwner = await verifyTagOwnership(tagId, userId);

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