import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import Header from './components/common/Header/Header'
import Footer from './components/common/Footer/Footer'
import ContactButton from './components/common/ContactButton/ContactButton'
import TopButton from './components/common/TopButton/TopButton'
import Home from './pages/Home/Home'
import { useRouteScroll } from './hooks/useRouteScroll'

// Home 진입 시 Archive와 Supabase 코드를 내려받지 않도록 경로별로 분리
const ArchiveList = lazy(() => import('./pages/Archive/ArchiveList/ArchiveList'))
const ArchiveDetail = lazy(() => import('./pages/Archive/ArchiveDetail/ArchiveDetail'))
const ArchiveWrite = lazy(() => import('./pages/Archive/ArchiveWrite/ArchiveWrite'))
const ArchiveLayout = lazy(() => import('./pages/Archive/ArchiveLayout'))
const RequireArchiveAdmin = lazy(() => import('./pages/Archive/ArchiveLayout').then((module) => ({ default: module.RequireArchiveAdmin })))

function RouteScrollHandler() {
  // BrowserRouter 안에서 라우트 변경에 따른 스크롤 위치를 제어
  useRouteScroll()

  return null
}

function App() {
  return (
    <BrowserRouter>
      <RouteScrollHandler />

      <Header />

      <main>
        <Suspense fallback={<section><div className="container" role="status">페이지를 불러오는 중…</div></section>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/archive" element={<ArchiveLayout />}>
            <Route index element={<ArchiveList />} />
            <Route path=":id" element={<ArchiveDetail />} />
            <Route element={<RequireArchiveAdmin />}>
              <Route path="new" element={<ArchiveWrite />} />
            </Route>
            <Route path="*" element={<Navigate to="/archive" replace />} />
          </Route>
        </Routes>
        </Suspense>
      </main>

      <Footer />

      <ContactButton />
      <TopButton />
    </BrowserRouter>
  )
}

export default App
