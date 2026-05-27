/**
 * Deadline Reminders Service
 * Checks for upcoming assignment deadlines and sends WhatsApp reminders
 */

import { db } from '@/db';
import { studentKitData } from '@/db/schema';
import { eq, sql, and } from 'drizzle-orm';
import { sendScanAlertWhatsApp } from '@/lib/whatsapp';

interface DeadlineReminder {
  userId: string;
  notificationPhoneNumber: string;
  userName: string;
  taskTitle: string;
  courseName: string;
  dueDate: Date;
  hoursUntilDue: number;
}

interface DeadlineData {
  dueDate: string;
  title: string;
  course: string;
}

export async function checkUpcomingDeadlines(): Promise<DeadlineReminder[]> {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(23, 59, 59, 999);

  const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000);

  const students = await db
    .select({
      userId: studentKitData.userId,
      notificationPhoneNumber: studentKitData.notificationPhoneNumber,
      assignmentDeadlines: studentKitData.assignmentDeadlines,
      lastNotificationSentAt: studentKitData.lastNotificationSentAt,
    })
    .from(studentKitData)
    .where(
      and(
        eq(studentKitData.whatsappNotificationsEnabled, true),
        sql`${studentKitData.lastNotificationSentAt} IS NULL OR ${studentKitData.lastNotificationSentAt} < ${twelveHoursAgo.toISOString()}`
      )
    );

  const reminders: DeadlineReminder[] = [];

  for (const student of students) {
    if (!student.assignmentDeadlines) continue;

    try {
      const deadlines: DeadlineData[] = typeof student.assignmentDeadlines === 'string'
        ? JSON.parse(student.assignmentDeadlines)
        : student.assignmentDeadlines;

      for (const deadline of deadlines) {
        const dueDate = new Date(deadline.dueDate);
        const hoursUntilDue = Math.floor((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60));

        if (hoursUntilDue > 0 && hoursUntilDue <= 24) {
          reminders.push({
            userId: student.userId,
            notificationPhoneNumber: student.notificationPhoneNumber || '',
            userName: 'Teman',
            taskTitle: deadline.title,
            courseName: deadline.course,
            dueDate,
            hoursUntilDue,
          });
        }
      }
    } catch (error) {
      console.error(`[Deadline Reminders] Failed to parse deadlines for user ${student.userId}:`, error);
    }
  }

  return reminders;
}

function formatDueDate(date: Date): { date: string; time: string } {
  return {
    date: date.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
    time: date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    }),
  };
}

function getUrgencyText(hoursUntilDue: number): string {
  if (hoursUntilDue <= 3) return '⚠️ SANGAT URGENT! ';
  if (hoursUntilDue <= 12) return '⏰ Pengingat: ';
  return '';
}

function buildReminderMessage(
  userName: string,
  taskTitle: string,
  courseName: string,
  formattedDate: string,
  formattedTime: string,
  urgencyText: string
): string {
  return `Halo ${userName}! 👋

${urgencyText}Jangan lupa tugas "${taskTitle}" (${courseName})

📅 Deadline: ${formattedDate}
⏰ Jam: ${formattedTime}

Semangat pengerjaannya! 💪

— Balikin Student Kit

Ini adalah pesan otomatis. Untuk mematikan notifikasi, buka Student Kit di dashboard Balikin.`;
}

export async function sendDeadlineReminder(reminder: DeadlineReminder): Promise<boolean> {
  const { notificationPhoneNumber, userName, taskTitle, courseName, dueDate, hoursUntilDue } =
    reminder;

  if (!notificationPhoneNumber) {
    console.warn(`[Deadline Reminders] No phone number for user ${reminder.userId}`);
    return false;
  }

  const { date: formattedDate, time: formattedTime } = formatDueDate(dueDate);
  const urgencyText = getUrgencyText(hoursUntilDue);
  const message = buildReminderMessage(
    userName,
    taskTitle,
    courseName,
    formattedDate,
    formattedTime,
    urgencyText
  );

  try {
    const result = await sendScanAlertWhatsApp({
      phoneNumber: notificationPhoneNumber,
      message,
    });

    if (result.success) {
      return true;
    } else {
      console.error(
        `[Deadline Reminders] ❌ Failed to send reminder to ${reminder.userId}:`,
        result.error
      );
      return false;
    }
  } catch (error) {
    console.error(`[Deadline Reminders] ❌ Error sending reminder:`, error);
    return false;
  }
}

function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

export async function processDeadlineReminders(): Promise<{
  processed: number;
  sent: number;
  failed: number;
}> {
  console.log('[Deadline Reminders] Starting to check for upcoming deadlines...');

  const reminders = await checkUpcomingDeadlines();
  console.log(`[Deadline Reminders] Found ${reminders.length} deadlines to remind`);

  if (reminders.length === 0) {
    return { processed: 0, sent: 0, failed: 0 };
  }

  const CHUNK_SIZE = 10;
  const chunks = chunk(reminders, CHUNK_SIZE);

  let sent = 0;
  let failed = 0;
  const userIdsToUpdate: string[] = [];

  for (const chunk of chunks) {
    const results = await Promise.allSettled(
      chunk.map(async (reminder) => {
        const success = await sendDeadlineReminder(reminder);
        if (success) {
          sent++;
          userIdsToUpdate.push(reminder.userId);
        } else {
          failed++;
        }
        return success;
      })
    );

    const failedInChunk = results.filter(r => r.status === 'rejected').length;
    failed += failedInChunk;

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  if (userIdsToUpdate.length > 0) {
    await Promise.all(
      userIdsToUpdate.map((userId) =>
        db
          .update(studentKitData)
          .set({ lastNotificationSentAt: new Date() })
          .where(eq(studentKitData.userId, userId))
      )
    );
    console.log(`[Deadline Reminders] Updated ${userIdsToUpdate.length} notification timestamps`);
  }

  console.log(`[Deadline Reminders] ✅ Processed ${reminders.length} reminders: ${sent} sent, ${failed} failed`);

  return {
    processed: reminders.length,
    sent,
    failed,
  };
}