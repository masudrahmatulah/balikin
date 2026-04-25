# Fix Date Hydration Mismatch Plan

## Context
Hydration error occurs because server and client render different dates due to timezone differences:
- Server (UTC): "28 Mar 2026"
- Client (WIB): "29 Mar 2026"

## Root Cause
Two components format dates using locale-aware methods that respect runtime timezone:
1. `tag-card.tsx:335` - Uses `Intl.DateTimeFormat` without `suppressHydrationWarning`
2. `client-tags-list.tsx:240` - Uses `date-fns` format() without `suppressHydrationWarning`

## Solution
Add `suppressHydrationWarning` prop to all date-rendering elements. This tells React to ignore the timezone-based mismatch. The dates will still display correctly to users in their local timezone.

## Files to Modify

1. **components/tag-card.tsx:335**
   - Add `suppressHydrationWarning` to the `<p>` element displaying `createdLabel`

2. **components/admin/client-tags-list.tsx:240**
   - Add `suppressHydrationWarning` to the element displaying formatted date

## Verification
1. Start dev server and check /dashboard for hydration errors
2. Test on production deployment
3. Verify dates display correctly
