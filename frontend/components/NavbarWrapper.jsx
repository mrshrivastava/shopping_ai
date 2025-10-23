'use client'

import Navbar from './Navbar'

export default function NavbarWrapper({ children }) {
  return (
    <div>
      <Navbar query="" setQuery={() => {}} />
      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
    </div>
  )
}
