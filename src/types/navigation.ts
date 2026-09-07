// Home 화면(One Page): 내부에서 스크롤되는 메뉴는 section id 사용
export interface SectionNavigationItem {
  id: string
  label: string
}

// Archive: 별도 라우트로 이동하는 메뉴는 path 사용
export interface PageNavigationItem {
  path: string
  label: string
}
