import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'chat',
  description: 'chat gpt hahah',
}

export default function page() {
  return(
    <main className="bg-blue-600">
      <h1>hello chat</h1>
    </main>
  )
}