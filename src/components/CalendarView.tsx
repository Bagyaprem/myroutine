
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { useJournal } from '@/contexts/JournalContext';
import { getMonthName, getDaysInMonth, getSimpleDate } from '@/utils/dateUtils';
import EntryCard from './EntryCard';

const CalendarView: React.FC = () => {
  const { entries, setCurrentEntry } = useJournal();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  
  // Navigate to previous month
  const prevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1));
    setSelectedDate(null);
  };
  
  // Navigate to next month
  const nextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1));
    setSelectedDate(null);
  };
  
  // Get days in current month
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  
  // Get first day of month (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  
  // Calculate days from previous month to show
  const prevMonthDays = firstDayOfMonth;
  
  // Create calendar days array
  const calendarDays = [];
  
  // Add days from previous month
  const prevMonthLength = getDaysInMonth(currentYear, currentMonth - 1);
  for (let i = prevMonthDays - 1; i >= 0; i--) {
    calendarDays.push({
      day: prevMonthLength - i,
      currentMonth: false,
      date: new Date(currentYear, currentMonth - 1, prevMonthLength - i)
    });
  }
  
  // Add days from current month
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push({
      day: i,
      currentMonth: true,
      date: new Date(currentYear, currentMonth, i)
    });
  }
  
  // Check how many more days we need to fill the calendar (6 rows x 7 days = 42)
  const remainingDays = 42 - calendarDays.length;
  
  // Add days from next month
  for (let i = 1; i <= remainingDays; i++) {
    calendarDays.push({
      day: i,
      currentMonth: false,
      date: new Date(currentYear, currentMonth + 1, i)
    });
  }
  
  // Check if a date has an entry
  const hasEntry = (date: Date) => {
    return entries.some(entry => getSimpleDate(entry.date) === getSimpleDate(date));
  };
  
  // Get entry for selected date
  const getSelectedDateEntry = () => {
    if (!selectedDate) return null;
    return entries.find(entry => getSimpleDate(entry.date) === getSimpleDate(selectedDate));
  };
  
  const selectedDateEntry = getSelectedDateEntry();
  
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };
  
  const handleViewEntry = (entry: typeof entries[0]) => {
    setCurrentEntry(entry);
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-serif font-medium">Journal Calendar</h2>
        
        <div className="flex space-x-2">
          <Button variant="ghost" size="icon" onClick={prevMonth}>
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <div className="text-base font-medium">
            {getMonthName(currentMonth)} {currentYear}
          </div>
          <Button variant="ghost" size="icon" onClick={nextMonth}>
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-xs font-medium py-2 text-muted-foreground">
            {day}
          </div>
        ))}
        
        {calendarDays.map((day, index) => {
          const isToday = day.currentMonth && day.day === new Date().getDate() && 
            currentMonth === new Date().getMonth() && currentYear === new Date().getFullYear();
          
          const isSelected = selectedDate && 
            day.date.getDate() === selectedDate.getDate() &&
            day.date.getMonth() === selectedDate.getMonth() &&
            day.date.getFullYear() === selectedDate.getFullYear();
          
          const dayHasEntry = hasEntry(day.date);
            
          return (
            <Button
              key={index}
              variant="ghost"
              className={`
                aspect-square rounded-md flex flex-col items-center justify-center p-0
                ${!day.currentMonth ? 'text-muted-foreground opacity-30' : ''}
                ${isSelected ? 'bg-primary/10 text-primary' : ''}
                ${isToday ? 'border border-primary' : ''}
              `}
              onClick={() => handleDateClick(day.date)}
            >
              <span className="text-sm">{day.day}</span>
              {dayHasEntry && (
                <div className={`w-1.5 h-1.5 rounded-full mt-1 ${isSelected ? 'bg-primary' : 'bg-primary/60'}`} />
              )}
            </Button>
          );
        })}
      </div>
      
      {selectedDate && (
        <div className="mt-8">
          <h3 className="text-lg font-medium mb-4">
            {selectedDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric',
              year: 'numeric' 
            })}
          </h3>
          
          {selectedDateEntry ? (
            <EntryCard 
              entry={selectedDateEntry} 
              onClick={() => handleViewEntry(selectedDateEntry)} 
            />
          ) : (
            <Card className="p-6 text-center bg-secondary/50">
              <p className="text-muted-foreground">No journal entry for this date.</p>
              <Button 
                variant="link" 
                className="mt-2"
                onClick={() => {
                  // Logic to create a new entry for this date would go here
                }}
              >
                Create new entry
              </Button>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default CalendarView;
