'use client';

import React from 'react';

interface TimePickerProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  className?: string;
}

export function TimePicker({ value, onChange, required = false, className = '' }: TimePickerProps) {
  // Generate hours (00-23)
  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));

  // Limited minute options
  const minutes = ['00', '10', '15', '20', '30', '45'];

  // Parse current value
  const [currentHour, currentMinute] = value ? value.split(':') : ['', ''];

  const handleHourChange = (newHour: string) => {
    const minute = currentMinute || '00';
    onChange(`${newHour}:${minute}`);
  };

  const handleMinuteChange = (newMinute: string) => {
    const hour = currentHour || '00';
    onChange(`${hour}:${newMinute}`);
  };

  return (
    <div className={`flex gap-2 ${className}`}>
      <select
        value={currentHour}
        onChange={(e) => handleHourChange(e.target.value)}
        required={required}
        className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">HH</option>
        {hours.map((hour) => (
          <option key={hour} value={hour}>
            {hour}
          </option>
        ))}
      </select>

      <span className="flex items-center text-slate-600 dark:text-slate-400 font-bold text-lg">:</span>

      <select
        value={currentMinute}
        onChange={(e) => handleMinuteChange(e.target.value)}
        required={required}
        className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">MM</option>
        {minutes.map((minute) => (
          <option key={minute} value={minute}>
            {minute}
          </option>
        ))}
      </select>
    </div>
  );
}
