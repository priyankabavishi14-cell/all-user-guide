import { isSvgIcon, isLucideIcon, getLucideIconName } from '@/lib/icon-utils'
import { LUCIDE_ICON_MAP } from '@/lib/lucide-icons'

interface Props {
  value: string
  className?: string
}

export default function PageIcon({ value, className = 'w-5 h-5' }: Props) {
  if (!value) return null

  if (isSvgIcon(value)) {
    return <img src={`/icons/${value}.svg`} alt={value} className={className} />
  }

  if (isLucideIcon(value)) {
    const name = getLucideIconName(value)
    const Icon = LUCIDE_ICON_MAP[name]
    if (Icon) return <Icon className={className} />
  }

  // Legacy emoji / free-text fallback
  return <span className="text-base leading-none">{value}</span>
}
