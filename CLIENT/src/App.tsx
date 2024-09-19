import { Route, Routes } from 'react-router-dom'
import LoginForm from './layouts/_auth/form/LoginForm'
import LayoutAuth from './layouts/_auth/LayoutAuth'
import Home from './pages/Home'

function App() {
  return (
    <div className='flex h-screen'>
      <Routes>
        <Route element={<LayoutAuth />}>
          <Route path='/login' element={<LoginForm />} />
          <Route path='/' element={<Home />} />
        </Route>
      </Routes>
    </div>
  )
}

export default App
