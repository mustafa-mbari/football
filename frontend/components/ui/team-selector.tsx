'use client';

import React, { useState, useRef, useEffect } from 'react';

interface Team {
  id: number;
  name: string;
  logoUrl?: string;
}

interface TeamSelectorProps {
  teams: Team[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabledTeamId?: number;
  required?: boolean;
}

export function TeamSelector({
  teams,
  value,
  onChange,
  placeholder = 'Select Team',
  disabledTeamId,
  required = false,
}: TeamSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedTeam = teams.find((t) => t.id.toString() === value);

  // Filter teams based on search term
  const filteredTeams = teams.filter((team) =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (teamId: number) => {
    if (teamId === disabledTeamId) return;
    onChange(teamId.toString());
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div ref={dropdownRef} className="relative">
      {/* Selected Team Display / Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-left flex items-center gap-3 min-h-[42px]"
      >
        {selectedTeam ? (
          <>
            {selectedTeam.logoUrl && (
              <img
                src={selectedTeam.logoUrl}
                alt={selectedTeam.name}
                className="w-6 h-6 object-contain flex-shrink-0"
              />
            )}
            <span className="flex-1">{selectedTeam.name}</span>
          </>
        ) : (
          <span className="text-slate-500 dark:text-slate-400">{placeholder}</span>
        )}
        <svg
          className={`w-4 h-4 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg shadow-lg max-h-[300px] overflow-hidden">
          {/* Search Input */}
          <div className="p-2 border-b border-slate-200 dark:border-slate-700">
            <input
              type="text"
              placeholder="Search teams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Team List */}
          <div className="overflow-y-auto max-h-[240px]">
            {filteredTeams.length === 0 ? (
              <div className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400 text-center">
                No teams found
              </div>
            ) : (
              filteredTeams.map((team) => {
                const isDisabled = team.id === disabledTeamId;
                const isSelected = team.id.toString() === value;

                return (
                  <button
                    key={team.id}
                    type="button"
                    onClick={() => handleSelect(team.id)}
                    disabled={isDisabled}
                    className={`w-full px-4 py-2.5 flex items-center gap-3 text-left transition-colors ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        : isDisabled
                        ? 'opacity-40 cursor-not-allowed'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-white'
                    }`}
                  >
                    {team.logoUrl ? (
                      <img
                        src={team.logoUrl}
                        alt={team.name}
                        className="w-6 h-6 object-contain flex-shrink-0"
                      />
                    ) : (
                      <div className="w-6 h-6 bg-slate-200 dark:bg-slate-600 rounded-full flex-shrink-0" />
                    )}
                    <span className="flex-1 text-sm font-medium">{team.name}</span>
                    {isSelected && (
                      <svg
                        className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Hidden input for form validation */}
      {required && (
        <input
          type="text"
          value={value}
          onChange={() => {}}
          required
          className="absolute opacity-0 pointer-events-none"
          tabIndex={-1}
        />
      )}
    </div>
  );
}
