'use client'

import { useState, useRef, useEffect } from 'react'

interface ActivityFormData {
  time: string
  activity: string
  location: string
}

interface AddActivityModalProps {
  isOpen: boolean
  onClose: () => void
  onActivityAdded: () => void // Changed from onAddActivity to indicate refresh is needed
  holidayId: string
  dayNumber: number
  dayDate: string
}

const AddActivityModal = ({ 
  isOpen, 
  onClose, 
  onActivityAdded, 
  holidayId,
  dayNumber, 
  dayDate 
}: AddActivityModalProps) => {
  const [formData, setFormData] = useState<ActivityFormData>({
    time: '',
    activity: '',
    location: ''
  })
  const [errors, setErrors] = useState<Partial<ActivityFormData>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({ time: '', activity: '', location: '' })
      setErrors({})
      setIsSubmitting(false)
    }
  }, [isOpen])

  // Handle escape key and outside clicks
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) onClose()
    }

    const handleOutsideClick = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node) && !isSubmitting) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.addEventListener('mousedown', handleOutsideClick)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.removeEventListener('mousedown', handleOutsideClick)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose, isSubmitting])

  const handleInputChange = (field: keyof ActivityFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<ActivityFormData> = {}

    if (!formData.time.trim()) {
      newErrors.time = 'Time is required'
    }
    if (!formData.activity.trim()) {
      newErrors.activity = 'Activity name is required'
    }
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/supabase/holiday-activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          holiday_id: holidayId,
          activity_name: formData.activity.trim(),
          venue_name: formData.location.trim(),
          start_time: formData.time + ':00', // Convert HH:MM to HH:MM:SS
          activity_date: dayDate,
          day_number: dayNumber,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create activity')
      }

      const data = await response.json()
      console.log('Activity created successfully:', data)

      // Close modal and trigger refresh
      onClose()
      onActivityAdded()

    } catch (error) {
      console.error('Error creating activity:', error)
      
      // Set a general error that can be displayed to the user
      setErrors({
        activity: error instanceof Error ? error.message : 'Failed to create activity. Please try again.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50 transition-opacity" />
      
      {/* Modal */}
      <div 
        ref={modalRef}
        className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-800 to-black text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Add Activity</h2>
              <p className="text-gray-200 text-sm">
                Day {dayNumber} - {formatDate(dayDate)}
              </p>
            </div>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="text-gray-300 hover:text-white transition-colors p-1 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Time Input */}
            <div>
              <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">
                Time
              </label>
              <input
                type="time"
                id="time"
                value={formData.time}
                onChange={(e) => handleInputChange('time', e.target.value)}
                disabled={isSubmitting}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed ${
                  errors.time ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Select time"
              />
              {errors.time && (
                <p className="mt-1 text-sm text-red-600">{errors.time}</p>
              )}
            </div>

            {/* Activity Input */}
            <div>
              <label htmlFor="activity" className="block text-sm font-medium text-gray-700 mb-2">
                Activity
              </label>
              <input
                type="text"
                id="activity"
                value={formData.activity}
                onChange={(e) => handleInputChange('activity', e.target.value)}
                disabled={isSubmitting}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed ${
                  errors.activity ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., Visit museum, Lunch at cafe"
              />
              {errors.activity && (
                <p className="mt-1 text-sm text-red-600">{errors.activity}</p>
              )}
            </div>

            {/* Location Input */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                disabled={isSubmitting}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed ${
                  errors.location ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., National Gallery, Central Park"
              />
              {errors.location && (
                <p className="mt-1 text-sm text-red-600">{errors.location}</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating...
                </>
              ) : (
                'Add Activity'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddActivityModal