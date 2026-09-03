import type { PageNavigationItem, SectionNavigationItem } from '../types'

// 기본 메뉴
// id 값은 각 섹션의 <section id="..."> 값과 같아야 함
export const sectionNavigationItems: SectionNavigationItem[] = [
  { id: 'about', label: 'About' },
  { id: 'experience', label: 'Experience' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
  { id: 'contact', label: 'Contact' },
]

// Archive는 Home 내부 섹션이 아니라 별도 페이지이므로 path로 관리
export const archiveNavigationItem: PageNavigationItem = {
  path: '/archive',
  label: 'Archive',
}
