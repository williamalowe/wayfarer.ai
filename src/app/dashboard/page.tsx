"use client";

import HolidaySidebar from "@/components/ui/HolidaySidebar";
import DashboardContent from "@/components/ui/DashboardContent";
import { useAuth } from "@/context/AuthContext";
import { useHolidays } from "@/context/HolidayContext";
import { useState, useEffect } from "react";
import { Holiday } from "@/types/Holiday";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const { nextHoliday, holidays } = useHolidays();
  const [selectedHoliday, setSelectedHoliday] = useState<Holiday | null>(null);
  const [timeToNext, setTimeToNext] = useState('');

  const handleHolidaySelect = (holiday: Holiday | null) => {
    setSelectedHoliday(holiday);
  };

  // Countdown timer for next holiday
  useEffect(() => {
    if (!nextHoliday) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const holidayDate = new Date(nextHoliday.start_date).getTime();
      const distance = holidayDate - now;

      if (distance < 0) {
        setTimeToNext('Holiday has started!');
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeToNext(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(timer);
  }, [nextHoliday]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-black">Access Denied</h1>
          <p className="mt-2 text-gray-700">
            Please sign in to access this page.
          </p>
        </div>
      </div>
    );
  }

  // Show countdown when no holiday is selected
  if (!selectedHoliday) {
    return (
      <div className="min-h-screen bg-gray-100 flex">
        {/* Sidebar */}
        <HolidaySidebar
          selectedHoliday={selectedHoliday}
          onHolidaySelect={handleHolidaySelect}
        />

        {/* Main Content - Countdown */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 p-6">
            {nextHoliday ? (
              <div className="max-w-2xl mx-auto text-center">
                <div className="bg-gradient-to-br from-gray-800 to-black rounded-2xl p-8 text-white shadow-xl border border-gray-300">
                  <div className="flex items-center justify-center mb-4">
                    <h2 className="text-2xl font-bold">Next Holiday Countdown</h2>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="text-3xl font-bold mb-2">{nextHoliday.name}</h3>
                    <div className="flex items-center justify-center text-lg opacity-90">
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
                    Departing {formatDate(nextHoliday.start_date)}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-8">
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-300">
                    <div className="text-2xl font-bold text-black">{holidays.length}</div>
                    <div className="text-sm text-gray-700">Total Holidays</div>
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-300">
                    <div className="text-2xl font-bold text-gray-800">
                      {holidays.filter(h => new Date(h.start_date) > new Date()).length}
                    </div>
                    <div className="text-sm text-gray-700">Upcoming</div>
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-300">
                    <div className="text-2xl font-bold text-gray-500">
                      {holidays.filter(h => new Date(h.end_date) < new Date()).length}
                    </div>
                    <div className="text-sm text-gray-700">Completed</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="max-w-md mx-auto text-center">
                <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-300">
                  <h2 className="text-xl font-bold text-black mb-2">No Upcoming Holidays</h2>
                  <p className="text-gray-700 mb-6">Start planning your next adventure!</p>
                  <div className="bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-medium transition-colors cursor-pointer">
                    Plan Your First Holiday
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <HolidaySidebar
        selectedHoliday={selectedHoliday}
        onHolidaySelect={handleHolidaySelect}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Dashboard Content */}
        <DashboardContent selectedHoliday={selectedHoliday} />
      </div>
    </div>
  );
}