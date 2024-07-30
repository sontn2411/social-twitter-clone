import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { twitter } from '~/assets'
import { Input } from '~/components/ui/input'
import { LoginValidation, TypeLoginValidation } from '~/lib/schema'
import { cn } from '~/lib/utils'

const LoginForm = () => {
  const {
    handleSubmit,
    register,
    formState: { errors }
  } = useForm<TypeLoginValidation>({
    resolver: zodResolver(LoginValidation)
  })

  const onSubmit = async (value: TypeLoginValidation) => {
    console.log('onSubmit', value)
  }
  return (
    <section className='bg-transparent h-fit'>
      <div className='w-[500px]'>
        <a href='#' className='flex items-center justify-center text-2xl font-semibold text-gray-900 dark:text-white'>
          <img className='w-[200px] h-auto' src={twitter} alt='logo' />
        </a>
        <div className='w-full rounded-lg shadow dark:border md:mt-0 xl:p-0 bg-gray-80'>
          <div className='p-6 space-y-4 md:space-y-6 sm:p-8'>
            <h1 className=' font-bold leading-tight tracking-tight text-center text-3xl text-white'>
              Sign in to your account
            </h1>
            <form className='space-y-4 md:space-y-6' onSubmit={handleSubmit(onSubmit)}>
              <div>
                <label
                  htmlFor='email'
                  className={cn('block mb-2 text-sm font-medium text-white', {
                    'text-red': errors.email
                  })}
                >
                  Your email
                </label>
                <Input
                  {...register('email')}
                  type='email'
                  name='email'
                  id='email'
                  className={cn(
                    'bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white',
                    { 'border-red': errors.email }
                  )}
                  placeholder='name@company.com'
                />
                {errors?.email && <p className='text-sm text-red mt-3'>{errors.email.message}</p>}
              </div>
              <div>
                <label
                  htmlFor='password'
                  className={cn('block mb-2 text-sm font-medium text-white', {
                    'text-red': errors.password
                  })}
                >
                  Password
                </label>
                <Input
                  {...register('password')}
                  type='password'
                  name='password'
                  id='password'
                  placeholder='••••••••'
                  className={cn(
                    'bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white',
                    { 'border-red': errors.password }
                  )}
                />
                {errors?.password && <p className='text-sm text-red mt-3'>{errors.password.message}</p>}
              </div>
              <div className='flex items-center justify-between'>
                <div className='flex items-start'>
                  <div className='flex items-center h-5'>
                    <Input
                      id='remember'
                      aria-describedby='remember'
                      type='checkbox'
                      className='w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-600 dark:ring-offset-gray-800'
                    />
                  </div>
                  <div className='ml-3 text-sm'>
                    <label className='text-gray-500 dark:text-gray-300'>Remember me</label>
                  </div>
                </div>
                <a href='#' className='text-sm font-medium text-primary-600 hover:underline dark:text-primary-500'>
                  Forgot password?
                </a>
              </div>
              <button
                type='submit'
                className='w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800'
              >
                Login form
              </button>
              <p className='text-sm font-light text-gray-500 dark:text-gray-400 text-center'>
                Don’t have an account yet?{' '}
                <a href='#' className='font-medium text-primary-600 hover:underline dark:text-primary-500'>
                  Sign up
                </a>
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}

export default LoginForm
