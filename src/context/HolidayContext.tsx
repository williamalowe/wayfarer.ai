'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './AuthContext'

interface Holiday {
  id: string
  name: string
  destination: string
  start_date: string
  end_date: string
  adults: number
  children: number
  description?: string
  user_id: string
  created_at: string
}

interface HolidayContextType {
  holidays: Holiday[]
  loading: boolean
  addHoliday: (holiday: Omit<Holiday, 'id' | 'user_id' | 'created_at'>) => Promise<Holiday>
  refreshHolidays: () => Promise<void>
  nextHoliday: Holiday | null
}

const HolidayContext = createContext<HolidayContextType | undefined>(undefined)

export function HolidayProvider({ children }: { children: React.ReactNode }) {
  const [holidays, setHolidays] = useState<Holiday[]>([])
  const [loading, setLoading] = useState(true)
  const { user, supabase } = useAuth()

  const fetchHolidays = async () => {
    if (!user) {
      setHolidays([])
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('holidays')
        .select('*')
        .eq('user_id', user.id)
        .order('start_date', { ascending: true })

      if (error) {
        console.error('Error fetching holidays:', error)
        return
      }

      setHolidays(data || [])
    } catch (error) {
      console.error('Error fetching holidays:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHolidays()
  }, [user])

  const addHoliday = async (holidayData: Omit<Holiday, 'id' | 'user_id' | 'created_at'>): Promise<Holiday> => {
    if (!user) throw new Error('User must be authenticated')

    const { data, error } = await supabase
      .from('holidays')
      .insert([{
        ...holidayData,
        user_id: user.id
      }])
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    // Refresh the holidays list to include the new holiday
    await fetchHolidays()
    
    // Return the created holiday
    return data as Holiday
  }

  const refreshHolidays = async () => {
    await fetchHolidays()
  }

  // Get next upcoming holiday
  const nextHoliday = holidays
    .filter(holiday => new Date(holiday.start_date) > new Date())
    .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())[0] || null

  const value = {
    holidays,
    loading,
    addHoliday,
    refreshHolidays,
    nextHoliday,
  }

  return (
    <HolidayContext.Provider value={value}>
      {children}
    </HolidayContext.Provider>
  )
}

export function useHolidays() {
  const context = useContext(HolidayContext)
  if (context === undefined) {
    throw new Error('useHolidays must be used within a HolidayProvider')
  }
  return context
}