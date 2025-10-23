import '../styles/globals.css'
import NavbarWrapper from '../components/NavbarWrapper'  // import separately

export const metadata = {
  title: 'Fashion Finder',
  description: 'Find products from posts',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <NavbarWrapper>{children}</NavbarWrapper>
      </body>
    </html>
  )
}
