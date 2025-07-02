"use client";

import { useState } from "react";
import { useHolidays } from '@/context/HolidayContext'
import NewHolidayModal from "./NewHolidayModal";
import { Holiday } from "@/types/Holiday";

interface HolidaySidebarProps {
  selectedHoliday: Holiday | null
  onHolidaySelect: (holiday: Holiday | null) => void
}

const HolidaySidebar = ({ selectedHoliday, onHolidaySelect }: HolidaySidebarProps) => {
  const { holidays, loading, nextHoliday } = useHolidays()
  const [showCreateModal, setShowCreateModal] = useState(false);

  const toggleModalStatus = () => {
    setShowCreateModal(!showCreateModal);
  }

  const handleHolidayClick = (holiday: Holiday) => {
    if (selectedHoliday?.id === holiday.id) {
      // If clicking the same holiday, deselect it
      onHolidaySelect(null);
    } else {
      // Select the new holiday
      onHolidaySelect(holiday);
    }
  }

  if (loading) {
    return (
      <div className="w-80 bg-white shadow-lg flex flex-col border border-black">
        <div className="px-6 py-4 border-b border-black">
          <h2 className="text-lg font-semibold text-black">My Holidays</h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-80 bg-white shadow-lg flex flex-col border border-black">
      {/* Header */}
      <div className="px-6 py-4 border-b border-black">
        <h2 className="text-lg font-semibold text-black">My Holidays</h2>
      </div>

      {/* Holidays List */}
      <div className="flex-1 overflow-y-auto">
        {holidays.length === 0 ? (
          <div className="p-6 text-center text-gray-600">
            <p>No holidays planned yet</p>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {holidays
              .sort(
                (a, b) =>
                  new Date(a.start_date).getTime() -
                  new Date(b.start_date).getTime()
              )
              .map((holiday) => {
                const isPast = new Date(holiday.end_date) < new Date();
                const isNext = holiday.id === nextHoliday?.id;
                const isSelected = selectedHoliday?.id === holiday.id;

                return (
                  <div
                    key={holiday.id}
                    onClick={() => handleHolidayClick(holiday)}
                    className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                      isSelected
                        ? "border-black bg-gray-100 shadow-md"
                        : isNext
                        ? "border-gray-800 bg-gray-50 hover:shadow-md"
                        : isPast
                        ? "border-gray-400 bg-gray-200 opacity-60 hover:opacity-80"
                        : "border-gray-600 bg-white hover:border-black hover:shadow-md"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-black text-sm">
                          {holiday.name}
                          {isNext && !isSelected && (
                            <span className="ml-2 text-xs bg-gray-300 text-black px-2 py-1 rounded-full">
                              Next
                            </span>
                          )}
                          {isSelected && (
                            <span className="ml-2 text-xs bg-black text-white px-2 py-1 rounded-full">
                              Selected
                            </span>
                          )}
                        </h3>
                        <div className="flex items-center mt-1 text-xs text-gray-700">
                          📍 {holiday.destination}
                        </div>
                        <div className="flex items-center mt-1 text-xs text-gray-700">
                          📅 {new Date(holiday.start_date).toLocaleDateString()} -{" "}
                          {new Date(holiday.end_date).toLocaleDateString()}
                        </div>
                        {holiday.description && (
                          <p className="mt-2 text-xs text-gray-600 line-clamp-2">
                            {holiday.description}
                          </p>
                        )}
                        <div className="mt-2 text-xs text-gray-600">
                          👥 {holiday.adults} adult{holiday.adults !== 1 ? 's' : ''}
                          {holiday.children > 0 && `, ${holiday.children} child${holiday.children !== 1 ? 'ren' : ''}`}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* Add Holiday Button - Moved to bottom */}
      <div className="p-4 border-t border-black">
        <button
          onClick={() => setShowCreateModal(true)}
          className="w-full bg-black hover:bg-gray-800 text-white p-3 rounded-lg transition-colors font-medium"
        >
          + Create New Holiday
        </button>
      </div>
      
      {showCreateModal && (
        <NewHolidayModal 
          updateModalStatus={toggleModalStatus}
          onHolidaySelect={onHolidaySelect}
        />
      )}
    </div>
  );
};

export default HolidaySidebar;