// TODO: Resolve Typing Issues
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect } from 'react'
import { Holiday } from '@/types/Holiday'
import { HolidayActivity } from '@/types/HolidayActivity'
import AddActivityModal from './AddActivityModal'
import PlanDayModal from './PlanDayModal'

interface ItineraryProps {
  selectedHoliday: Holiday | null
}

interface DayActivity {
  id: string
  time: string
  activity: string
  location: string
  description?: string
  sort_order: number
}

interface HolidayDay {
  day: number
  date: string
  activities: DayActivity[]
}

const DashboardItinerary = ({ selectedHoliday }: ItineraryProps) => {
  const [holidayDays, setHolidayDays] = useState<HolidayDay[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isPlanDayModalOpen, setIsPlanDayModalOpen] = useState(false)
  const [selectedDay, setSelectedDay] = useState<{ dayNumber: number; date: string } | null>(null)
  const [selectedPlanDay, setSelectedPlanDay] = useState<{ dayNumber: number; date: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deletingActivity, setDeletingActivity] = useState<string | null>(null)

  const formatDateShort = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const generateHolidayDays = (startDate: string, endDate: string): HolidayDay[] => {
    const days: HolidayDay[] = []
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    const currentDate = new Date(start)
    let dayNumber = 1
    
    while (currentDate <= end) {
      days.push({
        day: dayNumber,
        date: currentDate.toISOString().split('T')[0],
        activities: []
      })
      
      currentDate.setDate(currentDate.getDate() + 1)
      dayNumber++
    }
    
    return days
  }

  // Fetch activities from API
  const fetchActivities = async (holidayId: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/supabase/holiday-activities?holiday_id=${holidayId}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch activities')
      }
      
      const data = await response.json()
      return data.activities || []
    } catch (err) {
      console.error('Error fetching activities:', err)
      setError('Failed to load activities')
      return []
    } finally {
      setLoading(false)
    }
  }

  // Transform API activities to display format
  const transformActivitiesToDays = (activities: HolidayActivity[], holidayDays: HolidayDay[]): HolidayDay[] => {
    // Create a copy of holiday days
const daysWithActivities: HolidayDay[] = holidayDays.map(day => ({ 
  ...day, 
  activities: []
}))    
    // Group activities by day number
    activities.forEach(activity => {
      const dayIndex = activity.day_number! - 1 // Convert to 0-based index
      
      if (dayIndex >= 0 && dayIndex < daysWithActivities.length) {
        const transformedActivity: DayActivity = {
          id: activity.id,
          time: activity.start_time!,
          activity: activity.activity_name,
          location: activity.venue_name!,
          description: activity.description || undefined,
          sort_order: activity.sort_order || 0
        }
        
        daysWithActivities[dayIndex].activities.push(transformedActivity)
      }
    })
    
    // Sort activities within each day by start_time
    daysWithActivities.forEach(day => {
      day.activities.sort((a, b) => {
        // Convert time strings to comparable format (assumes HH:MM format)
        const timeA = a.time.replace(':', '')
        const timeB = b.time.replace(':', '')
        return timeA.localeCompare(timeB)
      })
    })
    
    return daysWithActivities
  }

  // Load activities when selectedHoliday changes
  useEffect(() => {
    if (selectedHoliday) {
      const emptyDays = generateHolidayDays(selectedHoliday.start_date, selectedHoliday.end_date)
      
      // Fetch activities and populate days
      fetchActivities(selectedHoliday.id).then(activities => {
        const populatedDays = transformActivitiesToDays(activities, emptyDays)
        setHolidayDays(populatedDays)
      })
    } else {
      setHolidayDays([])
    }
  }, [selectedHoliday])

  const handleAddActivity = (dayNumber: number) => {
    const day = holidayDays.find(d => d.day === dayNumber)
    if (day) {
      setError(null) // Clear any existing errors
      setSelectedDay({ dayNumber, date: day.date })
      setIsModalOpen(true)
    }
  }

  const handlePlanDay = (dayNumber: number) => {
    const day = holidayDays.find(d => d.day === dayNumber)
    if (day) {
      setError(null) // Clear any existing errors
      setSelectedPlanDay({ dayNumber, date: day.date })
      setIsPlanDayModalOpen(true)
    }
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedDay(null)
  }

  const handlePlanDayModalClose = () => {
    setIsPlanDayModalOpen(false)
    setSelectedPlanDay(null)
  }

  // Refresh activities after adding a new one
  const handleActivityAdded = () => {
    handleModalClose()
    setError(null) // Clear any existing errors
    
    // Refresh activities from API
    if (selectedHoliday) {
      const emptyDays = generateHolidayDays(selectedHoliday.start_date, selectedHoliday.end_date)
      fetchActivities(selectedHoliday.id).then(activities => {
        const populatedDays = transformActivitiesToDays(activities, emptyDays)
        setHolidayDays(populatedDays)
      })
    }
  }

  // Refresh activities after generating a day plan
  const handlePlanGenerated = () => {
    handlePlanDayModalClose()
    setError(null) // Clear any existing errors
    
    // Refresh activities from API
    if (selectedHoliday) {
      const emptyDays = generateHolidayDays(selectedHoliday.start_date, selectedHoliday.end_date)
      fetchActivities(selectedHoliday.id).then(activities => {
        const populatedDays = transformActivitiesToDays(activities, emptyDays)
        setHolidayDays(populatedDays)
      })
    }
  }

  const handleDeleteActivity = async (activityId: string) => {
    setDeletingActivity(activityId)
    setError(null) // Clear any existing errors
    
    try {
      const response = await fetch(`/api/supabase/holiday-activities/${activityId}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete activity')
      }
      
      // Remove from local state only if API call succeeds
      setHolidayDays(prevDays =>
        prevDays.map(day => ({
          ...day,
          activities: day.activities.filter(activity => activity.id !== activityId)
        }))
      )
      
    } catch (err) {
      console.error('Error deleting activity:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete activity')
      
      // Clear error after 5 seconds
      setTimeout(() => setError(null), 5000)
    } finally {
      setDeletingActivity(null)
    }
  }

  if (!selectedHoliday) {
    return (
      <div className="flex-1 p-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-300">
            <h2 className="text-xl font-bold text-black mb-2">No Holiday Selected</h2>
            <p className="text-gray-700">Select a holiday from the sidebar to view its detailed itinerary.</p>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-black mb-2">Itinerary</h1>
            <p className="text-gray-700">{selectedHoliday.name} - {selectedHoliday.destination}</p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <div className="text-red-800 font-medium">Error</div>
                    <div className="text-red-600 text-sm mt-1">{error}</div>
                  </div>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="text-red-400 hover:text-red-600 transition-colors"
                  aria-label="Dismiss error"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
            <span className="ml-3 text-gray-600">Loading activities...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-black mb-2">Itinerary</h1>
            <p className="text-gray-700">{selectedHoliday.name} - {selectedHoliday.destination}</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-red-800 font-medium">Error loading activities</div>
            <div className="text-red-600 text-sm mt-1">{error}</div>
            <button 
              onClick={() => handleActivityAdded()} // This will trigger a refresh
              className="mt-3 px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-black mb-2">Itinerary</h1>
            <p className="text-gray-700">{selectedHoliday.name} - {selectedHoliday.destination}</p>
          </div>

          <div className="space-y-6">
            {holidayDays.map((day) => (
              <div key={day.day} className="bg-white rounded-xl shadow-sm border border-gray-300 overflow-hidden">
                <div className="bg-gradient-to-r from-gray-800 to-black text-white p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">Day {day.day}</h3>
                      <p className="text-gray-200">{formatDateShort(day.date)}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm text-gray-200">
                          {day.activities.length} {day.activities.length === 1 ? 'activity' : 'activities'} planned
                        </p>
                      </div>
                      <button
                        onClick={() => handlePlanDay(day.day)}
                        className="inline-flex items-center px-3 py-1.5 bg-white/10 backdrop-blur-sm text-white text-sm font-medium rounded-lg border border-white/20 hover:bg-white/20 transition-colors"
                        title="Plan activities for this day"
                      >
                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        Plan Day
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  {day.activities.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                      <h4 className="text-lg font-medium text-black mb-2">No activities planned yet</h4>
                      <p className="text-gray-600 mb-4">Start planning your day by adding activities</p>
                      <button
                        onClick={() => handleAddActivity(day.day)}
                        className="inline-flex items-center px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add Activity
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-4 mb-6">
                        {day.activities.map((activity) => (
                          <div key={activity.id} className="flex items-start space-x-4 pb-4 border-b border-gray-200 last:border-b-0 last:pb-0">
                            <div className="flex-shrink-0 w-20 text-sm font-medium text-black">
                              {activity.time}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-black mb-1">{activity.activity}</h4>
                              <p className="text-sm text-gray-700 mb-1">{activity.location}</p>
                              {activity.description && (
                                <p className="text-xs text-gray-600 italic">{activity.description}</p>
                              )}
                            </div>
                            <div className="flex-shrink-0 flex items-center space-x-2">
                              <button
                                onClick={() => handleDeleteActivity(activity.id)}
                                disabled={deletingActivity === activity.id}
                                className={`p-1 transition-colors ${
                                  deletingActivity === activity.id
                                    ? 'text-gray-300 cursor-not-allowed'
                                    : 'text-gray-400 hover:text-red-500'
                                }`}
                                aria-label="Delete activity"
                              >
                                {deletingActivity === activity.id ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                                ) : (
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                )}
                              </button>
                              <div className="w-2 h-2 bg-black rounded-full"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="border-t border-gray-200 pt-4">
                        <button
                          onClick={() => handleAddActivity(day.day)}
                          className="inline-flex items-center px-3 py-2 bg-gray-200 text-black text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          Add Another Activity
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 bg-gray-100 rounded-xl p-6 border border-gray-300">
            <h3 className="text-lg font-semibold text-black mb-3">Planning Tips</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• Plan activities in chronological order for each day</li>
              <li>• Include estimated times to help with scheduling</li>
              <li>• Add buffer time between activities for travel and breaks</li>
              <li>• Consider local opening hours and seasonal availability</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Add Activity Modal */}
      <AddActivityModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onActivityAdded={handleActivityAdded}
        holidayId={selectedHoliday.id}
        dayNumber={selectedDay?.dayNumber || 0}
        dayDate={selectedDay?.date || ''}
      />

      {/* Plan Day Modal */}
      <PlanDayModal
        isOpen={isPlanDayModalOpen}
        onClose={handlePlanDayModalClose}
        onPlanGenerated={handlePlanGenerated}
        holidayId={selectedHoliday.id}
        dayNumber={selectedPlanDay?.dayNumber || 0}
        dayDate={selectedPlanDay?.date || ''}
      />
    </>
  )
}

export default DashboardItinerary