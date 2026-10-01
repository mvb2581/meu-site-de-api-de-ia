import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import Home from './pages/Home.jsx'
import Animes from './pages/Animes.jsx'
import AnimeDetail from './pages/AnimeDetail.jsx'
import Characters from './pages/Characters.jsx'
import CharacterDetail from './pages/CharacterDetail.jsx'
import Genres from './pages/Genres.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Profile from './pages/Profile.jsx'
import NotFound from './pages/NotFound.jsx'
import History from './pages/History.jsx'
import MyList from './pages/MyList.jsx'

export default function App() {
  return (
    <div className="au-shell d-flex flex-column min-vh-100">
      <Navbar />
      <main className="flex-fill">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/animes" element={<Animes />} />
          <Route path="/animes/:id" element={<AnimeDetail />} />
          <Route path="/personagens" element={<Characters />} />
          <Route path="/personagens/:id" element={<CharacterDetail />} />
          <Route path="/generos" element={<Genres />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Register />} />
          <Route path="/perfil" element={<Profile />} />
          <Route path="/historico" element={<History />} />
          <Route path="/minha-lista" element={<MyList />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
