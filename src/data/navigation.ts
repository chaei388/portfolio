import type { NavigationItem } from '../types'

// 헤더 네비게이션 항목
export const navigationItems: NavigationItem[] = [
  { href: '/#about', label: 'About' },
  { href: '/#experience', label: 'Experience' },
  { href: '/#skills', label: 'Skills' },
  { href: '/#projects', label: 'Projects' },
  { href: '/#contact', label: 'Contact' },
  { href: '/archive', label: 'Archive', isFeatured: true },
]
