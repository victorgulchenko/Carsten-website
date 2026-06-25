import type { Metadata } from 'next'
import { ChatUI } from '@/components/ChatUI'
import { getDailyNews } from '@/lib/chatContext'

export const metadata: Metadata = {
  title: 'Carsten GPT — Das Tandem',
  description:
    'Chatte mit Carsten GPT — kennt die täglichen KI-News und die Wissensbasis, antwortet auf Deutsch und erklärt technische Dinge zugänglich.',
}

export default async function ChatPage() {
  const news = await getDailyNews(4)

  return (
    <div className="mx-auto flex w-full flex-1 flex-col px-4 sm:px-5">
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col">
        <ChatUI
          newsSuggestions={news.map((n) => ({ title: n.title, summary: n.summary, source: n.source }))}
        />
      </div>
    </div>
  )
}
