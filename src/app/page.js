import BudgetTracker from '../components/BudgetTracker'

export default function Home() {
  return <BudgetTracker />
}'use client'

import dynamic from 'next/dynamic'

const BudgetTracker = dynamic(() => import('../components/BudgetTracker'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
      <div className="text-2xl font-bold text-gray-700">Loading...</div>
    </div>
  )
})

export default function Home() {
  return <BudgetTracker />
}