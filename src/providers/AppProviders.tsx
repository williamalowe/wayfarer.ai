'use client'

import { AuthProvider } from '@/context/AuthContext'
import { HolidayProvider } from '@/context/HolidayContext'

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <HolidayProvider>
        {children}
      </HolidayProvider>
    </AuthProvider>
  )
}