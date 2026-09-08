-- 기존 Supabase 프로젝트에 적용한 초기 데이터 기록. 같은 ID가 있으면 기존 DB 내용을 덮어쓰지 않음.

begin;

do $$ begin if not exists (select 1 from auth.users where id = '7d2bc12a-4449-443a-9bb0-8442fe89db9f' and email = 'day3856@gmail.com' and email_confirmed_at is not null) then raise exception '관리자 Auth 계정의 UID와 이메일 인증 상태를 확인해주세요.'; end if; end $$;

insert into public.archive_admins (user_id) values ('7d2bc12a-4449-443a-9bb0-8442fe89db9f') on conflict do nothing;

insert into public.archive_posts (id, owner_id, title, content, language, code_text, tags, status, created_at)
values ('backdrop-filter-deploy', '7d2bc12a-4449-443a-9bb0-8442fe89db9f', 'Vercel 배포 환경에서 backdrop-filter 미적용 오류', '로컬 개발 환경에서는 Header와 ContactButton의 글래스 효과가 정상적으로 보였지만, Vercel에 배포한 뒤에는 backdrop-filter의 blur 효과가 적용되지 않았다. 동일한 CSS를 사용하고 있었기 때문에 처음에는 브라우저 차이라고 생각했지만, 개발자 도구에서 로컬과 배포 환경의 최종 CSS를 비교해보니 빌드 이후 적용되는 스타일에 차이가 있었다. 특히 backdrop-filter와 함께 호환성을 위해 직접 작성해둔 -webkit-backdrop-filter가 배포 결과에서 예상과 다르게 처리되고 있었다.', 'css', 'backdrop-filter: saturate(160%) blur(1rem);
    -webkit-backdrop-filter: saturate(160%) blur(1rem);', array['CSS', 'Vite', 'Vercel', 'Troubleshooting']::text[], 'solved', '2026-09-07T00:00:00+09:00') on conflict (id) do nothing;

insert into public.archive_posts (id, owner_id, title, content, language, code_text, tags, status, created_at)
values ('active-section-scroll', '7d2bc12a-4449-443a-9bb0-8442fe89db9f', 'Header 메뉴 active 오류', 'Header에서 현재 보고 있는 섹션의 메뉴를 active 상태로 표시하기 위해 IntersectionObserver를 사용했다. 화면 위아래 영역을 각각 45%씩 줄여 중앙 근처에 들어온 섹션을 active로 판단하도록 구현했으며, 아래로 스크롤할 때는 대체로 정상적으로 동작했다. 하지만 마지막 Contact 섹션까지 내려간 뒤 다시 위로 스크롤하면 이전 섹션으로 active가 자연스럽게 전환되지 않는 경우가 발생했다. 화면 중앙의 좁은 영역과 섹션이 교차하는지만을 기준으로 상태를 변경하다 보니, 섹션의 높이와 스크롤 방향에 따라 현재 사용자가 보고 있는 영역과 active 메뉴가 어긋나는 문제가 있었다.', 'tsx', 'const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSectionId(entry.target.id)
        }
      })
    },
    {
      rootMargin: ''-45% 0px -45% 0px'',
    },
  )

  sectionIds.forEach((sectionId) => {
    const section = document.getElementById(sectionId)

    if (section) {
      observer.observe(section)
    }
  })', array['React', 'Scroll', 'IntersectionObserver', 'Custom Hook']::text[], 'solved', '2026-09-04T00:00:00+09:00') on conflict (id) do nothing;

insert into public.archive_posts (id, owner_id, title, content, language, code_text, tags, status, created_at)
values ('navigation-active-hash', '7d2bc12a-4449-443a-9bb0-8442fe89db9f', 'URL hash 기준 Header active 처리 오류', 'Header 메뉴의 active 상태를 표시할 때 URL hash와 스크롤 감지값을 함께 사용했다. 메뉴를 클릭하면 URL에 #skills와 같은 hash가 생기고, 클릭 직후에는 해당 메뉴가 바로 active 되도록 hash 값을 스크롤 감지값보다 우선하도록 구현했다. 하지만 한 번 hash가 생성된 뒤에는 사용자가 다른 섹션으로 직접 스크롤해 useActiveSection의 값이 변경되어도 기존 hash가 계속 우선 적용되었다. 그 결과 실제로 보고 있는 섹션은 바뀌었지만 Header에서는 처음 클릭한 메뉴가 계속 active 상태로 남는 문제가 발생했다.', 'tsx', 'const activeSectionId = useActiveSection(sectionIds)

  const hashSectionId = location.hash.replace(''#'', '''')

  // hash가 존재하면 스크롤 감지값보다 항상 우선됨
  const currentSectionId = hashSectionId || activeSectionId

  const isActive =
    location.pathname === ''/'' &&
    currentSectionId === item.id', array['React', 'React Router', 'Navigation', 'URL Hash']::text[], 'solved', '2026-09-03T00:00:00+09:00') on conflict (id) do nothing;

insert into public.archive_answers (id, post_id, owner_id, content, language, code_text, created_at)
values ('backdrop-filter-deploy-answer-1', 'backdrop-filter-deploy', '7d2bc12a-4449-443a-9bb0-8442fe89db9f', '로컬 코드만 확인하지 않고 Vercel에 배포된 결과의 CSS를 비교했다. 수동으로 추가했던 `-webkit-backdrop-filter`를 제거하고 `backdrop-filter`만 작성하도록 정리했다. 이후 빌드 결과에서 필요한 vendor prefix가 함께 생성되는 것을 확인했고, Header와 ContactButton의 blur 효과도 정상적으로 적용됐다. 이 과정에서 로컬에서는 정상적으로 보이는 스타일도 실제 배포 결과가 다를 수 있으므로, 배포 환경에서 문제가 발생하면 원본 코드뿐 아니라 최종 빌드 결과까지 확인해야 한다는 것을 배웠다.', 'css', '.contactButton {
  background: rgba(252, 253, 255, 0.72);
  backdrop-filter: blur(16px);
}', '2026-09-07T00:00:00+09:00') on conflict (id) do nothing;

insert into public.archive_answers (id, post_id, owner_id, content, language, code_text, created_at)
values ('active-section-scroll-answer-1', 'active-section-scroll', '7d2bc12a-4449-443a-9bb0-8442fe89db9f', '`IntersectionObserver`의 교차 여부만 사용하는 방식을 제거하고, 각 섹션과 현재 viewport가 실제로 겹치는 높이를 직접 계산했다. 섹션마다 현재 화면에 보이는 높이를 구한 뒤 가장 많이 보이는 섹션을 active로 선택했다. Sticky Header가 화면 상단을 차지하고 있기 때문에 Header 높이도 계산에서 제외했다. 또한 페이지 최하단에서는 Contact가 화면을 완전히 채우지 못하더라도 마지막 섹션을 active로 표시하도록 별도 예외 처리를 추가했다.

```tsx
const sectionRect = section.getBoundingClientRect()

const visibleTop = Math.max(
  sectionRect.top,
  visibleAreaTop,
)

const visibleBottom = Math.min(
  sectionRect.bottom,
  visibleAreaBottom,
)

const visibleHeight = Math.max(
  0,
  visibleBottom - visibleTop,
)

if (visibleHeight > maxVisibleHeight) {
  maxVisibleHeight = visibleHeight
  nextActiveSectionId = section.id
}
```

페이지 최하단은 별도로 처리했다.', 'tsx', 'const currentScrollBottom =
  window.scrollY + window.innerHeight

const documentHeight =
  document.documentElement.scrollHeight

const isPageBottom =
  documentHeight - currentScrollBottom <= 2

if (isPageBottom) {
  setActiveSectionId(
    sectionIds[sectionIds.length - 1],
  )
  return
}', '2026-09-07T00:00:00+09:00') on conflict (id) do nothing;

insert into public.archive_answers (id, post_id, owner_id, content, language, code_text, created_at)
values ('navigation-active-hash-answer-1', 'navigation-active-hash', '7d2bc12a-4449-443a-9bb0-8442fe89db9f', 'Header의 active 상태와 URL hash의 역할을 분리했다. 메뉴의 active 여부는 실제 스크롤 위치를 계산하는 `useActiveSection`의 결과를 기준으로 판단하고, URL hash는 현재 보고 있는 섹션을 주소에 반영하는 용도로만 사용했다.

이때 스크롤할 때마다 `pushState`를 사용하면 섹션이 바뀔 때마다 브라우저 방문 기록이 추가되어 뒤로가기를 여러 번 눌러야 하는 문제가 생긴다. 따라서 새로운 기록을 추가하지 않고 현재 주소만 변경하는 `replaceState`를 사용했다.

```tsx
const isActive =
  location.pathname === ''/'' &&
  activeSectionId === item.id
```

현재 active 섹션이 변경되면 URL만 갱신했다.', 'tsx', 'useEffect(() => {
  if (
    location.pathname !== ''/'' ||
    !activeSectionId
  ) {
    return
  }

  const nextHash = `#${activeSectionId}`

  if (window.location.hash === nextHash) {
    return
  }

  window.history.replaceState(
    null,
    '''',
    `${window.location.pathname}${window.location.search}${nextHash}`,
  )
}, [activeSectionId, location.pathname])', '2026-09-07T00:00:00+09:00') on conflict (id) do nothing;

commit;
