import { Navigate, Outlet } from 'react-router-dom'
import { bannerImage, twitter  } from '~/assets'

const LayoutAuth = () => {
  const isAuthenticated = false
  return (
    <>
      {isAuthenticated ? (
        <Navigate to='/' />
      ) : (
        <>
          <img src={twitter} alt='logo' className='hidden xl:block h-screen w-1/2 object-cover bg-no-repeat' /> 
          <section className='flex flex-1 justify-center items-center flex-col py-10'>
            <Outlet />
          </section>
          {/* <img src={bannerImage} alt='logo' className='hidden xl:block h-screen w-1/2 object-cover bg-no-repeat' /> */}
        </>
      )}
    </>
  )
}

export default LayoutAuth
