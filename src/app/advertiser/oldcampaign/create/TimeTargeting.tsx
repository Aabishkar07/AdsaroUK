
"use client";

/**
 * Time Targeting Component
 * 
 * This component handles time targeting selection and provides day_time data
 * that gets converted to the proper API format in the main page.
 * 
 * Component Output Structure (DayTimeValue):
 * [
 *   {"day": "MONDAY", "time_periods": ["00:00-06:00", "18:00-23:59"]},
 *   {"day": "TUESDAY", "time_periods": ["ALL"]},
 *   {"day": "WEDNESDAY", "time_periods": ["09:00-17:00"]}
 * ]
 * 
 * Final API Structure (converted in main page):
 * "day_time": {
 *   "SUNDAY:0": true,
 *   "SUNDAY:1": true,
 *   "MONDAY:16": true,
 *   "MONDAY:17": true
 * }
 * 
 * Where:
 * - "day": Day of the week (MONDAY, TUESDAY, etc.)
 * - "time_periods": Array of time ranges or "ALL" for entire day
 * - Keys are in format "DAY_NAME:PERIOD" where PERIOD is the hour (0-23)
 * - Values are boolean (true = enabled, false = disabled)
 */

import { useState, useEffect, useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface DayTimeValue {
  day: string;
  time_periods: string[];
}

interface TimeTargetingProps {
  onSelectionChange?: (selectedSlots: Set<string>) => void;
  onTimeDataChange?: (timeData: DayTimeValue[]) => void;
  initialSelections?: Set<string>;
}

export default function TimeTargeting({ onSelectionChange, onTimeDataChange, initialSelections }: TimeTargetingProps) {
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());
  const [activePreset, setActivePreset] = useState<string>("none");
  
  console.log("🔄 TimeTargeting: Component rendered, selectedSlots:", Array.from(selectedSlots));
  console.log("🔄 TimeTargeting: initialSelections prop:", initialSelections ? Array.from(initialSelections) : "undefined");

  // Function to determine active preset based on selections
  const updateActivePreset = useCallback((slots: Set<string>) => {
    const slotArray = Array.from(slots);
    
    // Check if it matches any preset
    if (slotArray.length === 0) {
      setActivePreset("none");
    } else if (slotArray.length === 168) { // 7 days * 24 hours
      setActivePreset("all");
    } else {
      // Check for weekdays (Monday-Friday, all hours)
      const weekdaySlots = [];
      for (const day of ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"]) {
        for (let hour = 0; hour < 24; hour++) {
          weekdaySlots.push(`${day}-${hour}`);
        }
      }
      if (weekdaySlots.every(slot => slots.has(slot)) && slotArray.length === weekdaySlots.length) {
        setActivePreset("weekdays");
        return;
      }
      
      // Check for weekends (Saturday-Sunday, all hours)
      const weekendSlots = [];
      for (const day of ["SATURDAY", "SUNDAY"]) {
        for (let hour = 0; hour < 24; hour++) {
          weekendSlots.push(`${day}-${hour}`);
        }
      }
      if (weekendSlots.every(slot => slots.has(slot)) && slotArray.length === weekendSlots.length) {
        setActivePreset("weekends");
        return;
      }
      
      setActivePreset("custom");
    }
  }, []);

  // Initialize with API data when component mounts or initialSelections changes
  useEffect(() => {
    if (initialSelections && initialSelections.size > 0) {
      console.log("🔄 TimeTargeting: Initializing with API selections:", Array.from(initialSelections));
      setSelectedSlots(new Set(initialSelections));
      updateActivePreset(initialSelections);
    } else {
      // Create mode: select all 24 hours for all 7 days by default
      console.log("🔄 TimeTargeting: Create mode - selecting all time slots by default");
      const allSlots = new Set<string>();
      ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"].forEach(day => {
        Array.from({ length: 24 }, (_, i) => i).forEach(hour => {
          allSlots.add(`${day}-${hour}`);
        });
      });
      setSelectedSlots(allSlots);
      setActivePreset("all");
      if (onSelectionChange) {
        onSelectionChange(allSlots);
      }
    }
  }, [initialSelections, updateActivePreset]);

  const days = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Define updateTimeData first before using it in useEffect
  const updateTimeData = useCallback((slots: Set<string>) => {
    if (!onTimeDataChange) return;

    console.log("🔄 TimeTargeting: updateTimeData called with slots:", Array.from(slots));
    console.log("🔄 TimeTargeting: slots.size:", slots.size);

    // Only send data if there are actual selections
    if (slots.size === 0) {
      console.log("🔄 TimeTargeting: No slots selected, sending empty array");
      onTimeDataChange([]);
      return;
    }

    const timeData: DayTimeValue[] = [];
    
    // Get unique days that actually have slots selected
    const selectedDays = new Set<string>();
    Array.from(slots).forEach(slot => {
      console.log("🔍 TimeTargeting: Processing slot:", slot);
      const day = slot.split('-')[0];
      console.log("🔍 TimeTargeting: Extracted day:", day);
      selectedDays.add(day);
    });
    
    console.log("🔄 TimeTargeting: Selected days:", Array.from(selectedDays));
    console.log("🔄 TimeTargeting: Total unique days found:", selectedDays.size);
    
    // ONLY process days that actually have selections - don't iterate through all days
    selectedDays.forEach(day => {
      const daySlots = Array.from(slots).filter(slot => slot.startsWith(day));
      console.log(`🔄 TimeTargeting: Processing day ${day}, found ${daySlots.length} slots:`, daySlots);
      
      if (daySlots.length === 0) {
        // This should never happen since we're only processing selected days
        console.log(`🔄 TimeTargeting: Warning - ${day} has no slots but was in selectedDays`);
        return;
      } else if (daySlots.length === 24) {
        // All hours selected for this day
        console.log(`🔄 TimeTargeting: ${day} has all 24 hours selected, adding "ALL"`);
        timeData.push({
          day: day,
          time_periods: ["ALL"]
        });
      } else {
        // Some hours selected, create time periods
        const timePeriods = createTimePeriods(daySlots);
        console.log(`🔄 TimeTargeting: ${day} has ${daySlots.length}/24 hours selected, creating periods:`, timePeriods);
        timeData.push({
          day: day,
          time_periods: timePeriods
        });
      }
    });

    console.log("🔄 TimeTargeting: Final timeData being sent:", timeData);
    console.log("🔄 TimeTargeting: IMPORTANT - Only selected days are included:", timeData.map(t => t.day));
    onTimeDataChange(timeData);
  }, [onTimeDataChange]);

  // Update time data whenever selection changes
  useEffect(() => {
    console.log("🔄 TimeTargeting: useEffect triggered, selectedSlots changed:", Array.from(selectedSlots));
    console.log("🔄 TimeTargeting: selectedSlots.size:", selectedSlots.size);
    
    // Only call updateTimeData if there are actual selections
    if (selectedSlots.size > 0) {
      console.log("🔄 TimeTargeting: Calling updateTimeData with selections");
      updateTimeData(selectedSlots);
    } else {
      console.log("🔄 TimeTargeting: No selections, sending empty array");
      if (onTimeDataChange) {
        onTimeDataChange([]);
      }
    }
  }, [selectedSlots, onTimeDataChange, updateTimeData]);

  const createTimePeriods = (daySlots: string[]): string[] => {
    const periods: string[] = [];
    const selectedHours = daySlots.map(slot => parseInt(slot.split('-')[1])).sort((a, b) => a - b);
    
    if (selectedHours.length === 0) return periods;
    
    let start = selectedHours[0];
    let end = start;
    
    for (let i = 1; i < selectedHours.length; i++) {
      if (selectedHours[i] === end + 1) {
        end = selectedHours[i];
      } else {
        // Gap found, save current period
        periods.push(formatTimePeriod(start, end));
        start = selectedHours[i];
        end = start;
      }
    }
    
    // Add the last period
    periods.push(formatTimePeriod(start, end));
    
    return periods;
  };

  const formatTimePeriod = useCallback((start: number, end: number): string => {
    const startTime = start.toString().padStart(2, '0') + ':00';
    const endTime = (end + 1).toString().padStart(2, '0') + ':00';
    return `${startTime}-${endTime}`;
  }, []);

  const toggleSlot = (day: string, hour: number) => {
    const slotKey = `${day}-${hour}`;
    const newSelectedSlots = new Set(selectedSlots);
    
    if (newSelectedSlots.has(slotKey)) {
      newSelectedSlots.delete(slotKey);
    } else {
      newSelectedSlots.add(slotKey);
    }
    
    setSelectedSlots(newSelectedSlots);
    updateActivePreset(newSelectedSlots);
    if (onSelectionChange) {
      onSelectionChange(newSelectedSlots);
    }
  };

  const toggleDay = (day: string) => {
    const daySlots = Array.from(selectedSlots).filter(slot => slot.startsWith(day));
    const newSelectedSlots = new Set(selectedSlots);
    
    if (daySlots.length === 24) {
      // All hours selected for this day, deselect all
      hours.forEach(hour => {
        newSelectedSlots.delete(`${day}-${hour}`);
      });
    } else {
      // Select all hours for this day
      hours.forEach(hour => {
        newSelectedSlots.add(`${day}-${hour}`);
      });
    }
    
    setSelectedSlots(newSelectedSlots);
    updateActivePreset(newSelectedSlots);
    if (onSelectionChange) {
      onSelectionChange(newSelectedSlots);
    }
  };

  const selectAll = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const allSlots = new Set<string>();
    days.forEach(day => {
      hours.forEach(hour => {
        allSlots.add(`${day}-${hour}`);
      });
    });
    setSelectedSlots(allSlots);
    setActivePreset("all");
    if (onSelectionChange) {
      onSelectionChange(allSlots);
    }
  };

  const selectWorkingDays = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const workingSlots = new Set<string>();
    const workingDays = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];
    workingDays.forEach(day => {
      hours.forEach(hour => {
        workingSlots.add(`${day}-${hour}`);
      });
    });
    setSelectedSlots(workingSlots);
    setActivePreset("working");
    if (onSelectionChange) {
      onSelectionChange(workingSlots);
    }
  };

  const selectWeekends = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const weekendSlots = new Set<string>();
    const weekendDays = ["SUNDAY", "SATURDAY"];
    weekendDays.forEach(day => {
      hours.forEach(hour => {
        weekendSlots.add(`${day}-${hour}`);
      });
    });
    setSelectedSlots(weekendSlots);
    setActivePreset("weekends");
    if (onSelectionChange) {
      onSelectionChange(weekendSlots);
    }
  };

  const selectNone = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedSlots(new Set());
    setActivePreset("none");
    if (onSelectionChange) {
      onSelectionChange(new Set());
    }
  };

  return (
    <div className="space-y-4">
      <Label className="text-lg font-semibold block">Time Targeting (Day & Time)</Label>
      
      {/* Time Grid */}
      <div className="border border-gray-300 rounded-md p-4 bg-white overflow-x-auto">
        <div className="grid grid-cols-[auto_repeat(24,1fr)] gap-1 text-xs min-w-max">
          {/* Header row with hours */}
          <div className="h-8"></div> {/* Empty corner */}
          {hours.map(hour => (
            <div key={hour} className="h-8 flex items-center justify-center font-medium text-gray-700">
              {hour}
            </div>
          ))}
          
          {/* Day rows */}
          {days.map(day => {
            const daySlots = Array.from(selectedSlots).filter(slot => slot.startsWith(day));
            const isDayFullySelected = daySlots.length === 24;
            const isDayPartiallySelected = daySlots.length > 0 && daySlots.length < 24;
            
            return (
              <div key={day} className="contents">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleDay(day);
                  }}
                  className={`h-8 flex items-center justify-center font-medium border-r pr-2 transition-all duration-200 ${
                    isDayFullySelected 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : isDayPartiallySelected
                      ? 'bg-blue-200 hover:bg-blue-300 text-blue-800'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                  title={`Click to ${isDayFullySelected ? 'deselect' : 'select'} all hours for ${day.charAt(0) + day.slice(1).toLowerCase()}`}
                >
                  {day.charAt(0) + day.slice(1).toLowerCase()}
                </button>
                {hours.map(hour => {
                  const slotKey = `${day}-${hour}`;
                  const isSelected = selectedSlots.has(slotKey);
                  return (
                    <button
                      key={hour}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleSlot(day, hour);
                      }}
                      className={`h-8 w-full border border-gray-200 transition-all duration-200 ${
                        isSelected 
                          ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-sm' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                      }`}
                      title={`${day.charAt(0) + day.slice(1).toLowerCase()} ${hour}:00 - Click to ${isSelected ? 'deselect' : 'select'}`}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Timezone info */}
      <p className="text-sm text-gray-600">
        Time targeting uses Pacific Time (PT) timezone. Click on day names to select/deselect entire days, or click individual time slots for precise control.
      </p>

      {/* Preset buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant={activePreset === "all" ? "default" : "outline"}
          size="sm"
          onClick={selectAll}
          className={`${
            activePreset === "all" 
              ? "bg-blue-600 hover:bg-blue-700 text-white" 
              : "bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
          }`}
        >
          All
        </Button>
        <Button
          type="button"
          variant={activePreset === "working" ? "default" : "outline"}
          size="sm"
          onClick={selectWorkingDays}
          className={`${
            activePreset === "working" 
              ? "bg-green-600 hover:bg-green-700 text-white" 
              : "bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
          }`}
        >
          Working days
        </Button>
        <Button
          type="button"
          variant={activePreset === "weekends" ? "default" : "outline"}
          size="sm"
          onClick={selectWeekends}
          className={`${
            activePreset === "weekends" 
              ? "bg-purple-600 hover:bg-purple-700 text-white" 
              : "bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200"
          }`}
        >
          Weekends
        </Button>
        <Button
          type="button"
          variant={activePreset === "none" ? "default" : "outline"}
          size="sm"
          onClick={selectNone}
          className={`${
            activePreset === "none" 
              ? "bg-red-600 hover:bg-red-700 text-white" 
              : "bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
          }`}
        >
          None
        </Button>
      </div>

      {/* Selection summary */}
      {selectedSlots.size > 0 && (
        <div className="mt-4 p-3 bg-blue-50 rounded text-sm">
          <div className="font-semibold text-blue-800 mb-2">
            Selection Summary: {selectedSlots.size} time slots selected
          </div>
          <div className="text-blue-700">
            {days.map(day => {
              const daySlots = Array.from(selectedSlots).filter(slot => slot.startsWith(day));
              if (daySlots.length === 0) return null;
              if (daySlots.length === 24) {
                return <span key={day} className="inline-block mr-2 px-2 py-1 bg-blue-200 rounded text-xs">{day.charAt(0) + day.slice(1).toLowerCase()}: ALL</span>;
              } else {
                return <span key={day} className="inline-block mr-2 px-2 py-1 bg-blue-200 rounded text-xs">{day.charAt(0) + day.slice(1).toLowerCase()}: {daySlots.length}/24</span>;
              }
            }).filter(Boolean)}
          </div>
        </div>
      )}

      {/* Debug info */}
      {/* {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-3 bg-gray-100 rounded text-xs">
          <div className="font-semibold mb-2">Debug: Generated day_time Structure (Mode + Edit Format)</div>
          <pre className="whitespace-pre-wrap">
            {JSON.stringify(
              days.map(day => {
                const daySlots = Array.from(selectedSlots).filter(slot => slot.startsWith(day));
                if (daySlots.length === 0) return null;
                if (daySlots.length === 24) {
                  return { day, time_periods: ["ALL"] };
                } else {
                  return { day, time_periods: createTimePeriods(daySlots) };
                }
              }).filter(Boolean),
              null,
              2
            )}
          </pre>
        </div>
      )} */}
    </div>
  );
} 
