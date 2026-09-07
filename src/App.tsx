import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Header from './components/common/Header/Header'
import Footer from './components/common/Footer/Footer'
import ContactButton from './components/common/ContactButton/ContactButton'
import TopButton from './components/common/TopButton/TopButton'
import Home from './pages/Home/Home'
import ArchiveList from './pages/Archive/ArchiveList/ArchiveList'
import ArchiveDetail from './pages/Archive/ArchiveDetail/ArchiveDetail'
import ArchiveWrite from './pages/Archive/ArchiveWrite/ArchiveWrite'
import ArchiveLayout, { RequireArchiveAdmin } from './pages/Archive/ArchiveLayout'
import { useRouteScroll } from './hooks/useRouteScroll'

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
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/archive" element={<ArchiveLayout />}>
            <Route index element={<ArchiveList />} />
            <Route path=":id" element={<ArchiveDetail />} />
            <Route element={<RequireArchiveAdmin />}>
              <Route path="new" element={<ArchiveWrite />} />
              <Route path=":id/edit" element={<ArchiveWrite />} />
            </Route>
          </Route>
        </Routes>
      </main>

      <Footer />

      <ContactButton />
      <TopButton />
    </BrowserRouter>
  )
}

export default App
