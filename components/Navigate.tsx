"use client"

import { useRouter } from 'next/navigation';

function Navigate({path}: {path: string}) {
    const router = useRouter();
    router.push(path);
  return (
    <></>
  )
}

export default Navigate