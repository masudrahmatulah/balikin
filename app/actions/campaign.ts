'use server';

import { db } from '@/db';
import { campaignLeads } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function subscribeCampaignLead(
  email: string,
  campaignName: string,
  source: string = 'landing_page',
  metadata?: Record<string, any>
) {
  if (!email || !campaignName) {
    throw new Error('Email and campaign name are required');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('Invalid email format');
  }

  try {
    // Check if lead already exists for this campaign
    const existingLead = await db
      .select()
      .from(campaignLeads)
      .where(
        and(
          eq(campaignLeads.email, email.toLowerCase()),
          eq(campaignLeads.campaignName, campaignName)
        )
      )
      .limit(1);

    if (existingLead.length > 0) {
      // Update existing lead if unsubscribed
      if (existingLead[0].status === 'unsubscribed') {
        await db
          .update(campaignLeads)
          .set({ status: 'subscribed', updatedAt: new Date() })
          .where(eq(campaignLeads.id, existingLead[0].id));
      }
      return {
        success: true,
        message: 'Already subscribed',
        isNew: false,
        email: email.toLowerCase(),
      };
    }

    // Insert new lead
    const newLead = await db
      .insert(campaignLeads)
      .values({
        email: email.toLowerCase(),
        campaignName,
        source,
        status: 'subscribed',
        metadata: metadata || {},
      })
      .returning();

    return {
      success: true,
      message: 'Successfully subscribed',
      isNew: true,
      email: email.toLowerCase(),
      leadId: newLead[0]?.id,
    };
  } catch (error) {
    console.error('Campaign subscription error:', error);
    throw new Error('Failed to subscribe. Please try again.');
  }
}

export async function unsubscribeCampaignLead(
  email: string,
  campaignName: string
) {
  if (!email || !campaignName) {
    throw new Error('Email and campaign name are required');
  }

  try {
    const result = await db
      .update(campaignLeads)
      .set({ status: 'unsubscribed', updatedAt: new Date() })
      .where(
        and(
          eq(campaignLeads.email, email.toLowerCase()),
          eq(campaignLeads.campaignName, campaignName)
        )
      )
      .returning();

    return {
      success: result.length > 0,
      message: result.length > 0 ? 'Unsubscribed successfully' : 'Lead not found',
    };
  } catch (error) {
    console.error('Unsubscribe error:', error);
    throw new Error('Failed to unsubscribe. Please try again.');
  }
}

export async function getCampaignLeads(campaignName: string) {
  try {
    const leads = await db
      .select()
      .from(campaignLeads)
      .where(eq(campaignLeads.campaignName, campaignName));

    return {
      success: true,
      total: leads.length,
      subscribed: leads.filter((l) => l.status === 'subscribed').length,
      leads,
    };
  } catch (error) {
    console.error('Get campaign leads error:', error);
    throw new Error('Failed to fetch campaign leads');
  }
}
