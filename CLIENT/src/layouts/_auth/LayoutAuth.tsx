import { Navigate, Outlet } from 'react-router-dom'
import { bannerImage } from '~/assets'

const LayoutAuth = () => {
  const isAuthenticated = false
  return (
    <>
      {isAuthenticated ? (
        <Navigate to='/' />
      ) : (
        <>
          <section className='flex flex-1 justify-center items-center flex-col py-10'>
            <Outlet />
          </section>

          <img src={bannerImage} alt='logo' className='hidden xl:block h-screen w-1/2 object-cover bg-no-repeat' />
        </>
      )}
    </>
  )
}

export default LayoutAuth
