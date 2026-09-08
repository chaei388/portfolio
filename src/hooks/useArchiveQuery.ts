// Supabase에서 데이터를 불러오는 공통 로직을 한 번 만들어두고, 목록/상세페이지 어디서든 재사용하는 훅

// 공통로직
// 데이터 요청 시작 → loading 표시
// → 성공하면 data 저장
// → 실패하면 error 저장
// → 페이지를 벗어나거나 요청 대상이 바뀌면 기존 요청 취소
// → 필요하면 refresh해서 다시 요청

import { useEffect, useState } from 'react'
import { archiveError } from '../lib/archiveApi'

  // useArchiveQuery가 load로 넘겨줘야 하는 함수는 아래와 같은 형태
  // function 어떤함수(signal: AbortSignal) {
  //   return Promise로 어떤 데이터를 반환 (async 함수면 자동으로 Promise 반환)
  // }
  // 1. 'signal: AbortSignal': signal이라는 매개변수의 타입은 AbortSignal
  // signal을 받는 이유: 요청을 취소할 수 있게 하기 위해
  // 2. Promise<T>: 함수가 즉시 값을 주는 게 아니라, 비동기 작업이 끝난 뒤 T 타입 데이터를 반환한다는 의미

  // 목록 조회 함수 listPosts는 로그인 전후에도 같은 함수이지만
  // Supabase가 돌려주는 데이터는 현재 인증 상태에 따라 달라질 수 있음
  // 방문자 → 공개 게시글만 조회
  // 관리자 → 공개 게시글 + 관리자가 볼 수 있는 데이터
  // 따라서 별도의 scope 변수로 인증상태 변경을 알려줌, scope 문자열이 바뀌면 useEffect 다시 실행
  // scope는 프론트엔드의 재조회 시점 관리일 뿐, 실제 DB 읽기·쓰기 권한 검사는 RLS(DB 함수)에서...
  // scope에 들어있는 세 값: ready(로그인 확인중/확인완료), user?.id(현재 로그인 사용자 구분), isAdmin(관리자인지 아닌지)
  // 인증 확인 중 - false:undefined:false
  // 비로그인 확인 완료 - true:undefined:false
  // 관리자 로그인 - true:관리자UID:true (유저 UID 넣은 이유는 관리자 계정 늘릴 경우 대비)

export function useArchiveQuery<T>(
  // 첫 번째 인자 load: 실제 데이터를 불러오는 함수를 넘김 (함수 실행이 아니라 함수 자체)
  load: (signal: AbortSignal) => Promise<T>, 
  // 두 번째 인자 scope: 요청을 구분 (방문자인지 관리자인지에 따라 DB가 제공하는 데이터가 다름)
  scope = '') {

  // 새로고침 횟수: 새로고침 발생 시 값을 바꿔, useEffect 실행 목적
  const [revision, setRevision] = useState(0) 

  // 데이터 + 어떤 요청을 통해 데이터가 만들어졌는지까지 같이 저장
  const [result, setResult] = useState<{
    // 타입
    load: typeof load | null; // 지금 이 훅의 인자로 들어온 load와 같은 타입 또는 null(초기값)
    scope: string; // 이 결과가 어떤 scope의 요청 결과인지 기록
    revision: number; // 이 데이터가 몇 번째 refresh 요청에서 나온 결과인지 기록
    data: T | null; // 실제로 Supabase에서 받아온 데이터를 저장 
    error: string // 요청 실패 시 사용자에게 보여줄 오류 문장
  }>({ 
    // 초기값
    load: null, 
    scope: '', 
    revision: -1, // 페이지를 맨 처음 불러오면 0회가 됨, -1은 아직 데이터 요청 미완료임을 나타내는 값
    data: null, 
    error: '' 
  })

  useEffect(() => {
    // AbortController는 진행 중인 요청에 “이제 그 요청은 필요 없다”고 알리기 위한 브라우저 기능
    // effect가 실행될 때마다 해당 요청만을 위한 controller를 만듦 (해당 요청만 취소할 수 있도록)
    // controller.signal은 요청에 전달하는 취소 신호 객체
    // signal.aborted로 해당 요청이 이미 취소되었는지 확인할 수 있음
    const controller = new AbortController()

    // load 함수 실행
    // .then(...) : 이 비동기 요청이 끝났을 때 어떻게 처리할지 정하는 부분
    load(controller.signal).then(
      // load 성공했을 때 실행할 함수
      // data에 load()가 반환한 실제 데이터가 들어감
      (data) => {
        // 바로 저장하지 않고, 요청이 아직 취소되지 않았는지 확인
        if (!controller.signal.aborted) 
          // 취소되지 않았다면 결과 저장
          setResult({ 
            load, 
            scope, 
            revision, 
            data, 
            error: '' // 에러는 없었으니 ''로
          })
      },
    // load 실패했을 때 실행할 함수
      (error: unknown) => {
        // 요청이 아직 취소되지 않았는지 확인
        // 사용자가 일부러 취소한 경우 오류로 취급하지 않고 무시
        if (!controller.signal.aborted) 
          setResult({ 
            load, 
            scope, 
            revision, 
            data: null,
            error: archiveError(error) // 사용자용 문장으로 에러 안내
          })
      },
    )

    // cleanup
    return () => controller.abort()
  
  }, [load, scope, revision]) // 의존성 배열
  // 아래 중 해당되면 useEffect 실행
  // load: 조회 함수가 바뀜 (ex. 상세 페이지에서 다른 게시글로 이동)
  // scope: 인증 상태나 사용자가 바뀜
  // revision: refresh()가 호출됨 - 사용자가 명시적으로 새로고침

  // 세 가지 중 하나라도 다르면 loading = true
  // 마지막 완료 결과가 현재 요청과 일치하는지를 비교
  const loading = 
    result.load !== load || // 마지막으로 완료된 요청의 load, 현재 요청의 load
    result.scope !== scope || // 마지막으로 완료된 요청의 scope, 현재 요청의 scope
    result.revision !== revision // 마지막으로 완료된 요청의 revision, 현재 revision

  return {
    // loading이 true면 → null (이전 요청의 오래된 데이터를 새 요청 중에 보여주지 않기 위함)
    // loading이 false면 → result.data
    data: loading ? null : result.data,

    // loading이 true면 → '' (이전 요청의 오류 메시지를 새 요청 중에 보여주지 않기 위함)
    // loading이 false면 → result.error
    error: loading ? '' : result.error,

    // 객체 속성이름과 여기서 만든 변수이름이 같으므로 축약문법. (loading: loading)
    // 위에서 계산한 loading을 반환. true/false)
    loading,

    // refresh 함수를 만들어서 반환
    // 호출하면 revision 숫자를 하나 올림 → seEffect 의존성에 revision이 있으므로 같은 데이터를 다시 요청
    refresh: () => setRevision((current) => current + 1),
  }
}
