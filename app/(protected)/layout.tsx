import Navigate from '@/components/Navigate';
import { getServerSession } from 'next-auth';
import React from 'react'

async function ProtectedLayout({children}: {children: React.ReactNode}) {
      const session = await getServerSession();
      if(!session?.user){
        return <Navigate path="/auth/login" />
      }
  return (
    <div>
        {children}
    </div>
  )
}

export default ProtectedLayout