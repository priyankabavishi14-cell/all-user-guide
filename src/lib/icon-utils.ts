export const SVG_ICONS = ['location', 'salesperson', 'customer', 'users', 'brand', 'category', 'subcategory', 'products', 'manageproducts', 'orders', 'email', 'rolepermission', 'customeruser', 'adminuser', 'assignuserpermission', 'acceptrejectorder'] as const
export type SvgIconName = (typeof SVG_ICONS)[number]

export function isSvgIcon(value: string): value is SvgIconName {
  return (SVG_ICONS as readonly string[]).includes(value)
}
