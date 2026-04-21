/**
 * Deadline Reminders Service
 * Checks for upcoming assignment deadlines and sends WhatsApp reminders
 */

import { db } from '@/db';
import { studentKitData } from '@/db/schema';
import { eq } from 'drizzle-orm';
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

/**
 * Check for deadlines within the next 24 hours
 * Returns list of deadlines that need reminders
 */
export async function checkUpcomingDeadlines(): Promise<DeadlineReminder[]> {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(23, 59, 59, 999);

  // Get all students with WhatsApp notifications enabled
  const students = await db
    .select({
      userId: studentKitData.userId,
      notificationPhoneNumber: studentKitData.notificationPhoneNumber,
      assignmentDeadlines: studentKitData.assignmentDeadlines,
      lastNotificationSentAt: studentKitData.lastNotificationSentAt,
    })
    .from(studentKitData)
    .where(eq(studentKitData.whatsappNotificationsEnabled, true));

  const reminders: DeadlineReminder[] = [];

  for (const student of students) {
    if (!student.assignmentDeadlines) continue;

    try {
      const deadlines = JSON.parse(student.assignmentDeadlines);

      for (const deadline of deadlines) {
        const dueDate = new Date(deadline.dueDate);
        const hoursUntilDue = Math.floor((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60));

        // Check if deadline is within 24 hours
        if (hoursUntilDue > 0 && hoursUntilDue <= 24) {
          // Check if we haven't sent a reminder in the last 12 hours
          const lastReminder = student.lastNotificationSentAt
            ? new Date(student.lastNotificationSentAt)
            : null;
          const hoursSinceLastReminder = lastReminder
            ? Math.floor((now.getTime() - lastReminder.getTime()) / (1000 * 60 * 60))
            : 25; // More than 24 hours if no reminder sent

          if (hoursSinceLastReminder >= 12) {
            reminders.push({
              userId: student.userId,
              notificationPhoneNumber: student.notificationPhoneNumber || '',
              userName: 'Teman', // We'll fetch the actual name if needed
              taskTitle: deadline.title,
              courseName: deadline.course,
              dueDate,
              hoursUntilDue,
            });
          }
        }
      }
    } catch (error) {
      console.error(`[Deadline Reminders] Failed to parse deadlines for user ${student.userId}:`, error);
    }
  }

  return reminders;
}

/**
 * Send WhatsApp reminder for a deadline
 */
export async function sendDeadlineReminder(reminder: DeadlineReminder): Promise<boolean> {
  const { notificationPhoneNumber, userName, taskTitle, courseName, dueDate, hoursUntilDue } =
    reminder;

  if (!notificationPhoneNumber) {
    console.warn(`[Deadline Reminders] No phone number for user ${reminder.userId}`);
    return false;
  }

  // Format due date
  const formattedDate = dueDate.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const formattedTime = dueDate.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Build urgency message
  let urgencyText = '';
  if (hoursUntilDue <= 3) {
    urgencyText = '⚠️ SANGAT URGENT! ';
  } else if (hoursUntilDue <= 12) {
    urgencyText = '⏰ Pengingat: ';
  }

  // Compose message
  const message = `Halo ${userName}! 👋

${urgencyText}Jangan lupa tugas "${taskTitle}" (${courseName})

📅 Deadline: ${formattedDate}
⏰ Jam: ${formattedTime}

Semangat pengerjaannya! 💪

— Balikin Student Kit

Ini adalah pesan otomatis. Untuk mematikan notifikasi, buka Student Kit di dashboard Balikin.`;

  try {
    const result = await sendScanAlertWhatsApp({
      phoneNumber: notificationPhoneNumber,
      message,
    });

    if (result.success) {
      // Update last notification sent time
      await db
        .update(studentKitData)
        .set({ lastNotificationSentAt: new Date() })
        .where(eq(studentKitData.userId, reminder.userId));

      console.log(
        `[Deadline Reminders] ✅ Reminder sent to ${reminder.userId} for "${taskTitle}"`
      );
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

/**
 * Process all pending deadline reminders
 * This function is called by the cron job
 */
export async function processDeadlineReminders(): Promise<{
  processed: number;
  sent: number;
  failed: number;
}> {
  console.log('[Deadline Reminders] Starting to check for upcoming deadlines...');

  const reminders = await checkUpcomingDeadlines();

  console.log(`[Deadline Reminders] Found ${reminders.length} deadlines to remind`);

  let sent = 0;
  let failed = 0;

  for (const reminder of reminders) {
    const success = await sendDeadlineReminder(reminder);
    if (success) {
      sent++;
    } else {
      failed++;
    }

    // Small delay between messages to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.log(`[Deadline Reminders] ✅ Processed ${reminders.length} reminders: ${sent} sent, ${failed} failed`);

  return {
    processed: reminders.length,
    sent,
    failed,
  };
}
