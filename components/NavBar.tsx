import Link from 'next/link'
import React from 'react'

function NavBar() {
  return (
    <div className='w-full h-24 flex justify-between items-center px-10'>
        <div>
            <p className='text-3xl font-bold'>InternHub</p>
        </div>
        <div className='flex gap-4 bg-black text-white p-2 rounded-lg'>
            <Link className='text-lg hover:text-gray-400' href="/">Home</Link>
            <Link className='text-lg hover:text-gray-400' href="/about-us">About Us</Link>
            <Link className='text-lg hover:text-gray-400 cursor-pointer text-blue-400 font-bold' href="/auth/login">Login</Link>
        </div>
    </div>
  )
}

export default NavBar