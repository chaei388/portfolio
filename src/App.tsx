import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Header from './components/common/Header/Header'
import Footer from './components/common/Footer/Footer'
import ContactButton from './components/common/ContactButton/ContactButton'
import TopButton from './components/common/TopButton/TopButton'
import Home from './pages/Home/Home'
import ArchiveList from './pages/Archive/ArchiveList/ArchiveList'
import ArchiveDetail from './pages/Archive/ArchiveDetail/ArchiveDetail'
import ArchiveWrite from './pages/Archive/ArchiveWrite/ArchiveWrite'

function App() {
  return (
    <BrowserRouter>
      <Header />

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/archive" element={<ArchiveList />} />
          <Route path="/archive/new" element={<ArchiveWrite />} />
          <Route path="/archive/:id" element={<ArchiveDetail />} />
        </Routes>
      </main>

      <Footer />

      <ContactButton />
      <TopButton />
    </BrowserRouter>
  )
}

export default App
