export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className='bg-blue-300 p-10'>{children}</div>
    )
}
