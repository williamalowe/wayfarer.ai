'use client'

import { useState } from "react"
import { useHolidays } from '@/context/HolidayContext'
import { Holiday } from '@/types/Holiday'

interface NewHolidayModalProps {
  updateModalStatus: () => void;
  onHolidaySelect: (holiday: Holiday) => void;
}

const NewHolidayModal = ({ updateModalStatus, onHolidaySelect }: NewHolidayModalProps) => {
  const { addHoliday } = useHolidays()
const [newHoliday, setNewHoliday] = useState({
  name: '',
  destination: '',
  start_date: '',
  end_date: '',
  adults: 1,
  children: 0,
  description: '',
  // Add the missing fields with default values
  estimated_budget: null,
  actual_budget: null,
  currency: null,
  status: 'planning', // or null if you prefer
  priority: null,
  accommodation: null,
  transportation: null,
  notes: null
})

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCreateHoliday = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newHoliday.name || !newHoliday.destination || !newHoliday.start_date || !newHoliday.end_date) return

    // Validate dates
    const startDate = new Date(newHoliday.start_date)
    const endDate = new Date(newHoliday.end_date)
    
    if (endDate <= startDate) {
      setError('End date must be after start date')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const createdHoliday = await addHoliday(newHoliday)
      
      // Reset form
setNewHoliday({ 
  name: '', 
  destination: '', 
  start_date: '', 
  end_date: '', 
  adults: 1, 
  children: 0, 
  description: '',
  // Reset the additional fields
  estimated_budget: null,
  actual_budget: null,
  currency: null,
  status: 'planning',
  priority: null,
  accommodation: null,
  transportation: null,
  notes: null
})
      
      // Select the newly created holiday
      onHolidaySelect(createdHoliday)
      
      // Close modal only after successful creation
      updateModalStatus()
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    if (!isLoading) {
      updateModalStatus()
    }
  }
      
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6 relative border border-gray-300">
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-90 rounded-xl flex items-center justify-center z-10">
            <div className="flex flex-col items-center space-y-3">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-gray-300 rounded-full animate-spin"></div>
                <div className="absolute top-0 left-0 w-12 h-12 border-4 border-black rounded-full animate-spin border-t-transparent"></div>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-black">Creating Holiday</p>
                <p className="text-sm text-gray-700">Please wait while we save your holiday...</p>
              </div>
            </div>
          </div>
        )}

        <h3 className="text-lg font-bold text-black mb-4">Create New Holiday</h3>
        
        <form onSubmit={handleCreateHoliday} className="space-y-4">
          {error && (
            <div className="p-3 bg-gray-100 border border-gray-400 rounded-md">
              <p className="text-sm text-black">{error}</p>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Holiday Name *
            </label>
            <input
              type="text"
              value={newHoliday.name}
              onChange={(e) => setNewHoliday({ ...newHoliday, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-100 disabled:text-gray-600"
              placeholder="e.g., Summer Vacation"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Destination *
            </label>
            <input
              type="text"
              value={newHoliday.destination}
              onChange={(e) => setNewHoliday({ ...newHoliday, destination: e.target.value })}
              className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-100 disabled:text-gray-600"
              placeholder="e.g., Paris, France"
              required
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Start Date *
              </label>
              <input
                type="date"
                value={newHoliday.start_date}
                onChange={(e) => setNewHoliday({ ...newHoliday, start_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-100 disabled:text-gray-600"
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                End Date *
              </label>
              <input
                type="date"
                value={newHoliday.end_date}
                onChange={(e) => setNewHoliday({ ...newHoliday, end_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-100 disabled:text-gray-600"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Adults *
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={newHoliday.adults}
                onChange={(e) => setNewHoliday({ ...newHoliday, adults: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-100 disabled:text-gray-600"
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Children
              </label>
              <input
                type="number"
                min="0"
                max="20"
                value={newHoliday.children}
                onChange={(e) => setNewHoliday({ ...newHoliday, children: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-100 disabled:text-gray-600"
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Description
            </label>
            <textarea
              value={newHoliday.description}
              onChange={(e) => setNewHoliday({ ...newHoliday, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-100 disabled:text-gray-600"
              placeholder="Optional description..."
              rows={3}
              disabled={isLoading}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isLoading}
              className="flex-1 px-4 py-2 text-black bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-black hover:bg-gray-800 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-md transition-colors flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </>
              ) : (
                'Create Holiday'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default NewHolidayModal