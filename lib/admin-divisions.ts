/**
 * Division System for Admin Dashboard
 * Defines division types, permissions, and role-based access control
 */

export const Division = {
  PRODUCTION: 'production',
  CUSTOMER_SERVICE: 'customer_service',
  MARKETING: 'marketing',
  ADMIN: 'admin', // Super admin with full access
} as const;

export type DivisionType = typeof Division[keyof typeof Division];

/**
 * Division-specific permissions
 * Each division has access to specific features and pages
 */
export const DivisionPermissions = {
  [Division.PRODUCTION]: [
    'print_queue',
    'bulk_qr',
    'stock_status',
    'material_logs',
    'vdp_tool',
    'production_dashboard',
    'manufacturing_queue',
    'vdp_batch_download',
    'system_health_monitor',
    'sticker_sheets',
  ],
  [Division.CUSTOMER_SERVICE]: [
    'payment_verification',
    'user_360',
    'whatsapp_link',
    'client_management',
    'sticker_orders',
    'sticker_sheets',
    'requests',
    'verification_queue',
    'lost_found_success_rate',
    'batch_activation_metrics',
  ],
  [Division.MARKETING]: [
    'analytics',
    'conversion_funnel',
    'module_performance',
    'finder_to_buyer',
    'marketing_dashboard',
    'campaigns',
    'geo_scan_heatmap',
    'analytics_dashboard',
  ],
  [Division.ADMIN]: ['*'], // Full access to all features
} as const;

/**
 * Division display names and descriptions
 */
export const DivisionInfo = {
  [Division.PRODUCTION]: {
    name: 'Production',
    nameIndonesian: 'Produksi',
    description: 'The Manufacturing Hub - Manage print queue, bulk QR generation, and stock status',
    descriptionIndonesian: 'Pusat Produksi - Kelola antrian cetak, generator QR massal, dan status stok',
    color: 'blue',
    icon: '🏭',
  },
  [Division.CUSTOMER_SERVICE]: {
    name: 'Customer Service',
    nameIndonesian: 'Layanan Pelanggan',
    description: 'The Support Center - Handle payments, user management, and customer support',
    descriptionIndonesian: 'Pusat Layanan - Tangani pembayaran, manajemen pengguna, dan dukungan pelanggan',
    color: 'green',
    icon: '💬',
  },
  [Division.MARKETING]: {
    name: 'Marketing',
    nameIndonesian: 'Pemasaran',
    description: 'The Growth & Analytics Lab - Monitor conversions, analytics, and performance',
    descriptionIndonesian: 'Lab Pertumbuhan & Analitik - Pantau konversi, analitik, dan kinerja',
    color: 'purple',
    icon: '📊',
  },
  [Division.ADMIN]: {
    name: 'Super Admin',
    nameIndonesian: 'Administrator',
    description: 'Full access to all divisions and features',
    descriptionIndonesian: 'Akses penuh ke semua divisi dan fitur',
    color: 'yellow',
    icon: '👑',
  },
} as const;

/**
 * Navigation items per division
 * Defines which sidebar menu items are visible to each division
 */
export const DivisionNavigation = {
  [Division.PRODUCTION]: [
    { title: 'Dashboard', href: '/admin', icon: '📊' },
    { title: 'Print Queue', href: '/admin/print-queue', icon: '🖨️' },
    { title: 'Stock Status', href: '/admin/production/stock', icon: '📊' },
    { title: 'Material Logs', href: '/admin/material-logs', icon: '📋' },
    { title: 'VDP Tool', href: '/admin/vdp-tool', icon: '🔧' },
    { title: 'Tags', href: '/admin/tags', icon: '🏷️' },
    { title: 'Master PIN Stiker', href: '/admin/sticker-sheets', icon: '🔑' },
  ],
  [Division.CUSTOMER_SERVICE]: [
    { title: 'Dashboard', href: '/admin/cs', icon: '📊' },
    { title: 'Payments', href: '/admin/cs/payments', icon: '💳' },
    { title: 'Client Management', href: '/admin', icon: '👥' },
    { title: 'Tags', href: '/admin/tags', icon: '🏷️' },
    { title: 'Sticker Orders', href: '/admin/sticker-orders', icon: '📦' },
    { title: 'Master PIN Stiker', href: '/admin/sticker-sheets', icon: '🔑' },
    { title: 'Requests', href: '/admin/requests', icon: '📨' },
    { title: 'Modules', href: '/admin/modules', icon: '🧩' },
  ],
  [Division.MARKETING]: [
    { title: 'Dashboard', href: '/admin/marketing', icon: '📊' },
    { title: 'Analytics', href: '/admin/marketing/analytics', icon: '📈' },
    { title: 'Conversion Funnel', href: '/admin/marketing/conversion', icon: '🔄' },
    { title: 'Module Performance', href: '/admin/marketing/modules', icon: '📊' },
    { title: 'Campaigns', href: '/admin/marketing/campaigns', icon: '🎯' },
  ],
  [Division.ADMIN]: [
    // Admin sees all navigation items from all divisions
    ...[
      { title: 'Overview', href: '/admin', icon: '🏠' },
      { title: 'Print Queue', href: '/admin/print-queue', icon: '🖨️' },
      { title: 'Stock Status', href: '/admin/production/stock', icon: '📊' },
      { title: 'Payments', href: '/admin/cs/payments', icon: '💳' },
      { title: 'Client Management', href: '/admin', icon: '👥' },
      { title: 'Tags', href: '/admin/tags', icon: '🏷️' },
      { title: 'Sticker Orders', href: '/admin/sticker-orders', icon: '📦' },
      { title: 'Master PIN Stiker', href: '/admin/sticker-sheets', icon: '🔑' },
      { title: 'Analytics', href: '/admin/marketing/analytics', icon: '📈' },
      { title: 'Modules', href: '/admin/modules', icon: '🧩' },
      { title: 'Material Logs', href: '/admin/material-logs', icon: '📋' },
      { title: 'VDP Tool', href: '/admin/vdp-tool', icon: '🔧' },
      { title: 'Requests', href: '/admin/requests', icon: '📨' },
    ],
  ],
} as const;

/**
 * Check if a user has permission for a specific feature
 * @param userDivision - The user's division
 * @param permission - The permission to check
 * @returns true if user has permission
 */
export function hasPermission(
  userDivision: DivisionType | null | undefined,
  permission: string
): boolean {
  if (!userDivision) return false;

  const permissions = DivisionPermissions[userDivision];
  if (!permissions) return false;

  // Admin has all permissions
  if (permissions.includes('*')) return true;

  return permissions.includes(permission as any);
}

/**
 * Check if a user can access a specific page/route
 * @param userDivision - The user's division
 * @param path - The route path to check
 * @returns true if user can access the route
 */
export function canAccessRoute(
  userDivision: DivisionType | null | undefined,
  path: string
): boolean {
  if (!userDivision) return false;
  if (userDivision === Division.ADMIN) return true;

  const navItems = DivisionNavigation[userDivision] || [];
  return navItems.some(item => path.startsWith(item.href));
}

/**
 * Get the default division for a user
 * Used when assigning divisions to existing admins
 */
export function getDefaultDivision(): DivisionType {
  return Division.PRODUCTION; // Default to production division
}

/**
 * Validate if a division value is valid
 */
export function isValidDivision(value: string): value is DivisionType {
  return Object.values(Division).includes(value as DivisionType);
}

/**
 * Get division info with fallback
 */
export function getDivisionInfo(division: DivisionType | null | undefined) {
  if (!division || !isValidDivision(division)) {
    return DivisionInfo[Division.PRODUCTION]; // Fallback to production
  }
  return DivisionInfo[division];
}
