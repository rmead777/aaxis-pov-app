import './globals.css'

export const metadata = {
  title: 'AAXIS Proof of Value',
  description: 'No Risk. No Commitment. Prove It First.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
