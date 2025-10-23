'use client'
import { useRouter } from 'next/navigation'
import Link from 'next/link';

export default function Navbar() {
  const router = useRouter()

  return (
    <nav className="bg-white shadow p-4 flex justify-between items-center">
      <h1 className="font-bold text-lg">
        <Link href="/" className="hover:opacity-80 transition">
          CULTURE CIRCLE
        </Link>
      </h1>

      <button
        onClick={() => router.push('/search')}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
      >
        Search
      </button>
    </nav>
  )
}
