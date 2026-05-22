// ─── Local SVG icons (files in public/icons/) ─────────────────────────────────
export const SVG_ICONS = [
  'location',
  'salesperson',
  'customer',
  'users',
  'brand',
  'category',
  'subcategory',
  'products',
  'manageproducts',
  'orders',
  'email',
  'rolepermission',
  'customeruser',
  'adminuser',
  'assignuserpermission',
  'acceptrejectorder',
  'introduction',
  'warehouse',
  'roles',
] as const

export type SvgIconName = (typeof SVG_ICONS)[number]

export function isSvgIcon(value: string): value is SvgIconName {
  return (SVG_ICONS as readonly string[]).includes(value)
}

// ─── Lucide icon helpers ───────────────────────────────────────────────────────
export function isLucideIcon(value: string): boolean {
  return value.startsWith('lucide:')
}

export function getLucideIconName(value: string): string {
  return value.slice(7)
}
