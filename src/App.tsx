import { Routes, Route } from 'react-router-dom'
import { MainPage } from './components/MainPage'
import { SavePage } from './components/SavePage'
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/save" element={<SavePage />} />
    </Routes>
  )
}

export default App