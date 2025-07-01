'use client'

import { useAuth } from '@/hooks/useAuth'
import { useState, useEffect } from 'react'
// import { CalendarIcon, PlusIcon, ClockIcon, MapPinIcon } from 'lucide-react'

interface Holiday {
  id: string
  name: string
  destination: string
  startDate: string
  endDate: string
  description?: string
}

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth()
  const [holidays, setHolidays] = useState<Holiday[]>([
    {
      id: '1',
      name: 'Summer Vacation',
      destination: 'Bali, Indonesia',
      startDate: '2025-08-15',
      endDate: '2025-08-25',
      description: 'Tropical paradise getaway'
    },
    {
      id: '2',
      name: 'Winter Ski Trip',
      destination: 'Aspen, Colorado',
      startDate: '2025-12-20',
      endDate: '2025-12-27',
      description: 'Skiing and mountain adventures'
    }
  ])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newHoliday, setNewHoliday] = useState({
    name: '',
    destination: '',
    startDate: '',
    endDate: '',
    description: ''
  })
  const [timeToNext, setTimeToNext] = useState('')

  // Get next upcoming holiday
  const nextHoliday = holidays
    .filter(holiday => new Date(holiday.startDate) > new Date())
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())[0]

  // Countdown timer
  useEffect(() => {
    if (!nextHoliday) return

    const timer = setInterval(() => {
      const now = new Date().getTime()
      const holidayDate = new Date(nextHoliday.startDate).getTime()
      const distance = holidayDate - now

      if (distance < 0) {
        setTimeToNext('Holiday has started!')
        return
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24))
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((distance % (1000 * 60)) / 1000)

      setTimeToNext(`${days}d ${hours}h ${minutes}m ${seconds}s`)
    }, 1000)

    return () => clearInterval(timer)
  }, [nextHoliday])

  const handleCreateHoliday = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newHoliday.name || !newHoliday.destination || !newHoliday.startDate || !newHoliday.endDate) return

    const holiday: Holiday = {
      id: Date.now().toString(),
      ...newHoliday
    }

    setHolidays([...holidays, holiday])
    setNewHoliday({ name: '', destination: '', startDate: '', endDate: '', description: '' })
    setShowCreateModal(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
          <p className="mt-2 text-gray-600">Please sign in to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-80 bg-white shadow-lg flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">My Holidays</h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors"
              title="Create New Holiday"
            >
              {/* <PlusIcon className="w-4 h-4" /> */}
            </button>
          </div>
        </div>

        {/* Holidays List */}
        <div className="flex-1 overflow-y-auto">
          {holidays.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              {/* <CalendarIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" /> */}
              <p>No holidays planned yet</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                Create your first holiday
              </button>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {holidays
                .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
                .map((holiday) => {
                  const isUpcoming = new Date(holiday.startDate) > new Date()
                  const isPast = new Date(holiday.endDate) < new Date()
                  
                  return (
                    <div
                      key={holiday.id}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        holiday.id === nextHoliday?.id
                          ? 'border-blue-500 bg-blue-50'
                          : isPast
                          ? 'border-gray-200 bg-gray-50 opacity-60'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-sm">
                            {holiday.name}
                            {holiday.id === nextHoliday?.id && (
                              <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                Next
                              </span>
                            )}
                          </h3>
                          <div className="flex items-center mt-1 text-xs text-gray-600">
                            {/* <MapPinIcon className="w-3 h-3 mr-1" /> */}
                            {holiday.destination}
                          </div>
                          <div className="flex items-center mt-1 text-xs text-gray-600">
                            {/* <CalendarIcon className="w-3 h-3 mr-1" /> */}
                            {new Date(holiday.startDate).toLocaleDateString()} - {new Date(holiday.endDate).toLocaleDateString()}
                          </div>
                          {holiday.description && (
                            <p className="mt-2 text-xs text-gray-500">{holiday.description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome back, {user.email?.split('@')[0]}!</p>
            </div>
            <button
              onClick={signOut}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="flex-1 p-6">
          {nextHoliday ? (
            <div className="max-w-2xl mx-auto text-center">
              {/* Countdown Card */}
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
                <div className="flex items-center justify-center mb-4">
                  {/* <ClockIcon className="w-8 h-8 mr-3" /> */}
                  <h2 className="text-2xl font-bold">Next Holiday Countdown</h2>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-3xl font-bold mb-2">{nextHoliday.name}</h3>
                  <div className="flex items-center justify-center text-lg opacity-90">
                    {/* <MapPinIcon className="w-5 h-5 mr-2" /> */}
                    {nextHoliday.destination}
                  </div>
                </div>

                <div className="bg-white/20 rounded-xl p-6 backdrop-blur-sm">
                  <div className="text-4xl font-mono font-bold mb-2">
                    {timeToNext}
                  </div>
                  <div className="text-sm opacity-90">
                    Until your adventure begins!
                  </div>
                </div>

                <div className="mt-6 text-sm opacity-90">
                  Departing {new Date(nextHoliday.startDate).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 mt-8">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="text-2xl font-bold text-gray-900">{holidays.length}</div>
                  <div className="text-sm text-gray-600">Total Holidays</div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="text-2xl font-bold text-green-600">
                    {holidays.filter(h => new Date(h.startDate) > new Date()).length}
                  </div>
                  <div className="text-sm text-gray-600">Upcoming</div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="text-2xl font-bold text-gray-400">
                    {holidays.filter(h => new Date(h.endDate) < new Date()).length}
                  </div>
                  <div className="text-sm text-gray-600">Completed</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-md mx-auto text-center">
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                {/* <CalendarIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" /> */}
                <h2 className="text-xl font-bold text-gray-900 mb-2">No Upcoming Holidays</h2>
                <p className="text-gray-600 mb-6">Start planning your next adventure!</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Plan Your First Holiday
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Holiday Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Create New Holiday</h3>
            
            <form onSubmit={handleCreateHoliday} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Holiday Name *
                </label>
                <input
                  type="text"
                  value={newHoliday.name}
                  onChange={(e) => setNewHoliday({ ...newHoliday, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Summer Vacation"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Destination *
                </label>
                <input
                  type="text"
                  value={newHoliday.destination}
                  onChange={(e) => setNewHoliday({ ...newHoliday, destination: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Paris, France"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={newHoliday.startDate}
                    onChange={(e) => setNewHoliday({ ...newHoliday, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date *
                  </label>
                  <input
                    type="date"
                    value={newHoliday.endDate}
                    onChange={(e) => setNewHoliday({ ...newHoliday, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newHoliday.description}
                  onChange={(e) => setNewHoliday({ ...newHoliday, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Optional description..."
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                >
                  Create Holiday
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}