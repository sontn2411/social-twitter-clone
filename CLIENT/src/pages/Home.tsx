import { googleIcon } from '~/assets'

const Home = () => {
  return (
    <div className='flex flex-col'>
      <span className='text-7xl font-bold pb-16'>Happening now</span>
      <span className='text-3xl font-bold'>Join today.</span>
      {/* login google  */}
      <div className='pt-10' style={{ maxWidth: '300px' }}>
        <button className='flex bg-white justify-center items-center rounded-3xl gap-2 p-2 w-full'>
          <img src={googleIcon} alt='google' width='8%' />
          <span className='text-slate-600 font-semibold text-sm'>Sign up with Google</span>
        </button>
        <div className='flex items-center gap-3 py-2'>
          <span className='line'></span>
          <span className='text-center text-or'>or</span>
          <span className='line'></span>
        </div>
        <button className=' w-full rounded-3xl p-2 bg-primary-main  '>
          <span className='font-bold'>Sign up</span>
        </button>
        <span className='text-xs'>
          By signing up, you agree to the{' '}
          <a href='#' className='text-primary-main '>
            Terms of Service{' '}
          </a>
          and
          <a href='#' className='text-primary-main '>
            {' '}
            Privacy Policy
          </a>
          , including{' '}
          <a href='#' className='text-primary-main '>
            Cookie Use
          </a>
          .
        </span>

        <div className='flex flex-col pt-10 gap-4'>
          <span className='text-1xl font-bold'>Already have an account?</span>
          <button className='w-full rounded-3xl p-2 border '>
            <span className='font-bold text-primary-main'>Sign in</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Home
