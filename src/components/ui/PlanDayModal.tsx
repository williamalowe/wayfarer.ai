'use client'

import { useState } from 'react'

interface PlanDayModalProps {
  isOpen: boolean
  onClose: () => void
  onPlanGenerated: () => void
  holidayId: string
  dayNumber: number
  dayDate: string
}

const PlanDayModal = ({ 
  isOpen, 
  onClose, 
  onPlanGenerated, 
  holidayId, 
  dayNumber, 
  dayDate 
}: PlanDayModalProps) => {
  const [preferences, setPreferences] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const formatDateShort = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsGenerating(true)
    setError(null)

    try {
      // Call OpenAI API to generate day plan
      const response = await fetch('/api/openai/plan-day', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          holidayId,
          dayNumber,
          dayDate,
          preferences: preferences.trim() || undefined
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate day plan')
      }

      // Reset form and close modal
      setPreferences('')
      onPlanGenerated()
      
    } catch (err) {
      console.error('Error generating day plan:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate day plan')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleClose = () => {
    if (!isGenerating) {
      setPreferences('')
      setError(null)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-black">Plan Day {dayNumber}</h2>
              <p className="text-sm text-gray-600">{formatDateShort(dayDate)}</p>
            </div>
            <button
              onClick={handleClose}
              disabled={isGenerating}
              className={`p-2 rounded-lg transition-colors ${
                isGenerating 
                  ? 'text-gray-400 cursor-not-allowed' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
              aria-label="Close modal"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center">
                <svg className="w-4 h-4 text-red-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-red-800 text-sm">{error}</div>
              </div>
            </div>
          )}

          <div className="mb-6">
            <label htmlFor="preferences" className="block text-sm font-medium text-black mb-2">
              Planning Preferences
            </label>
            <textarea
              id="preferences"
              value={preferences}
              onChange={(e) => setPreferences(e.target.value)}
              placeholder="Is there anything in particular that you're looking to do?"
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none"
              rows={6}
              disabled={isGenerating}
            />
            <p className="mt-2 text-xs text-gray-500">
              Optional: Tell us about your interests, preferred activity types, budget constraints, or any specific places you&apos;d like to visit.
            </p>
          </div>

          <div className="flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isGenerating}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                isGenerating
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isGenerating}
              className={`px-6 py-2 text-sm font-medium rounded-lg transition-colors ${
                isGenerating
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-black text-white hover:bg-gray-800'
              }`}
            >
              {isGenerating ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating Plan...
                </div>
              ) : (
                'Generate Day Plan'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PlanDayModal