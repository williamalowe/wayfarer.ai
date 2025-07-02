'use client'

import { Holiday } from '@/types/Holiday'
import { useState, useEffect } from 'react'
import DashboardItinerary from './DashboardItinerary'

interface MainContentProps {
  selectedHoliday: Holiday | null
}

const DashboardContent = ({ selectedHoliday }: MainContentProps) => {
  const [timeToSelected, setTimeToSelected] = useState('')
  const [activeView, setActiveView] = useState<'overview' | 'itinerary'>('overview')

  // Countdown timer for selected holiday
  useEffect(() => {
    if (!selectedHoliday) return

    const timer = setInterval(() => {
      const now = new Date().getTime()
      const holidayDate = new Date(selectedHoliday.start_date).getTime()
      const distance = holidayDate - now

      if (distance < 0) {
        const end_date = new Date(selectedHoliday.end_date).getTime()
        if (now < end_date) {
          setTimeToSelected('Holiday in progress!')
        } else {
          setTimeToSelected('Holiday completed!')
        }
        return
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24))
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((distance % (1000 * 60)) / 1000)

      setTimeToSelected(`${days}d ${hours}h ${minutes}m ${seconds}s`)
    }, 1000)

    return () => clearInterval(timer)
  }, [selectedHoliday])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const getDuration = (start_date: string, end_date: string) => {
    const start = new Date(start_date)
    const end = new Date(end_date)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getStatus = (holiday: Holiday) => {
    const now = new Date()
    const start = new Date(holiday.start_date)
    const end = new Date(holiday.end_date)
    
    if (now < start) return 'upcoming'
    if (now >= start && now <= end) return 'active'
    return 'completed'
  }

  // Navigation bar component
  const NavigationBar = () => (
    <div className="bg-white border-b border-black px-6 py-4">
      <div className="max-w-4xl mx-auto">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveView('overview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeView === 'overview'
                ? 'border-black text-black'
                : 'border-transparent text-gray-600 hover:text-black hover:border-gray-400'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveView('itinerary')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeView === 'itinerary'
                ? 'border-black text-black'
                : 'border-transparent text-gray-600 hover:text-black hover:border-gray-400'
            }`}
          >
            Itinerary
          </button>
        </nav>
      </div>
    </div>
  )

  // Show navigation only when a holiday is selected
  const showNavigation = selectedHoliday !== null

  // Render itinerary view
  if (activeView === 'itinerary') {
    return (
      <div className="flex flex-col h-full">
        {showNavigation && <NavigationBar />}
        <DashboardItinerary selectedHoliday={selectedHoliday} />
      </div>
    )
  }

  // Show selected holiday details (overview) - DashboardContent only shows when holiday is selected
  if (!selectedHoliday) return null

  const status = getStatus(selectedHoliday)
  const duration = getDuration(selectedHoliday.start_date, selectedHoliday.end_date)
  
  return (
    <div className="flex flex-col h-full">
      {showNavigation && <NavigationBar />}
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Holiday Header */}
          <div className="bg-gradient-to-br from-gray-800 to-black rounded-2xl p-8 text-white shadow-xl mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold mb-2">{selectedHoliday.name}</h1>
                <div className="flex items-center text-xl opacity-90">
                  <span>{selectedHoliday.destination}</span>
                </div>
              </div>
              <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                status === 'upcoming' ? 'bg-white/20 text-white' :
                status === 'active' ? 'bg-gray-500/20 text-gray-100' :
                'bg-gray-700/20 text-gray-200'
              }`}>
                {status === 'upcoming' ? 'Upcoming' :
                 status === 'active' ? 'In Progress' :
                 'Completed'}
              </div>
            </div>

            {status === 'upcoming' && (
              <div className="bg-white/20 rounded-xl p-6 backdrop-blur-sm">
                <div className="text-3xl font-mono font-bold mb-2">
                  {timeToSelected}
                </div>
                <div className="text-sm opacity-90">
                  Until your adventure begins!
                </div>
              </div>
            )}

            {status === 'active' && (
              <div className="bg-white/20 rounded-xl p-6 backdrop-blur-sm">
                <div className="text-2xl font-bold mb-2">
                  🎉 Enjoy your holiday!
                </div>
                <div className="text-sm opacity-90">
                  Holiday in progress
                </div>
              </div>
            )}
          </div>

          {/* Holiday Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-300">
              <h3 className="text-lg font-semibold text-black mb-3">Dates</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <div>
                  <span className="font-medium">Start:</span> {formatDate(selectedHoliday.start_date)}
                </div>
                <div>
                  <span className="font-medium">End:</span> {formatDate(selectedHoliday.end_date)}
                </div>
                <div>
                  <span className="font-medium">Duration:</span> {duration} day{duration !== 1 ? 's' : ''}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-300">
              <h3 className="text-lg font-semibold text-black mb-3">Travelers</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <div>
                  <span className="font-medium">Adults:</span> {selectedHoliday.adults}
                </div>
                  <div>
                    <span className="font-medium">Children:</span> {selectedHoliday.children}
                  </div>
                <div>
                  <span className="font-medium">Total:</span> {selectedHoliday.adults! + (selectedHoliday.children || 0)} people
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-300">
              <h3 className="text-lg font-semibold text-black mb-3">Status</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                  status === 'upcoming' ? 'bg-gray-200 text-black' :
                  status === 'active' ? 'bg-gray-400 text-white' :
                  'bg-gray-600 text-white'
                }`}>
                  {status === 'upcoming' ? 'Upcoming Trip' :
                   status === 'active' ? 'Currently Active' :
                   'Trip Completed'}
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {selectedHoliday.description && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-300">
              <h3 className="text-lg font-semibold text-black mb-3">Description</h3>
              <p className="text-gray-700 leading-relaxed">{selectedHoliday.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DashboardContent