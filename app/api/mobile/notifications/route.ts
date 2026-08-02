import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { db } from '@/db';
import { notificationLogs, tags } from '@/db/schema';
import { eq, desc, and, inArray } from 'drizzle-orm';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

/**
 * Get notifications for user's tags.
 * Returns WhatsApp/Email delivery notifications.
 */
export async function GET() {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Get user's tags
    const userTags = await db.query.tags.findMany({
      where: eq(tags.ownerId, userId),
      columns: { id: true },
    });

    if (userTags.length === 0) {
      return NextResponse.json([]);
    }

    const userTagIds = userTags.map(tag => tag.id);

    // Get notification logs for user's tags
    const notifications = await db.query.notificationLogs.findMany({
      where: inArray(notificationLogs.tagId, userTagIds),
      orderBy: desc(notificationLogs.createdAt),
      limit: 20,
    });

    // Format notifications
    const formattedNotifications = notifications.map((notification) => {
      const timeAgo = notification.createdAt
        ? formatDistanceToNow(new Date(notification.createdAt), {
            addSuffix: true,
            locale: id,
          })
        : 'Baru saja';

      return {
        id: notification.id,
        type: notification.type,
        message: notification.message,
        status: notification.status,
        time: timeAgo,
        createdAt: notification.createdAt,
      };
    });

    return NextResponse.json(formattedNotifications);
  } catch (error) {
    // Return empty array on error instead of 500 for better UX
    return NextResponse.json([], { status: 200 });
  }
}
