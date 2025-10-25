'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface League {
  id: number;
  name: string;
  country?: string;
  season?: string;
  logoUrl?: string;
}

interface LeagueSelectorProps {
  leagues: League[];
  selectedLeagueId: string;
  onLeagueChange: (leagueId: string) => void;
  className?: string;
}

export default function LeagueSelector({
  leagues,
  selectedLeagueId,
  onLeagueChange,
  className = ''
}: LeagueSelectorProps) {
  const getLeagueLogo = (league: League) => {
    if (league.logoUrl) {
      return (
        <img
          src={league.logoUrl}
          alt={league.name}
          className="w-6 h-6 object-contain inline-block"
        />
      );
    }
    return null;
  };

  // Show first 3 leagues as tabs
  const visibleLeagues = leagues.slice(0, 3);
  const dropdownLeagues = leagues.slice(3);

  // Check if selected league is in dropdown
  const isSelectedInDropdown = dropdownLeagues.some(
    (league) => league.id.toString() === selectedLeagueId
  );

  if (leagues.length === 0) {
    return null;
  }

  // If 3 or fewer leagues, show all as tabs
  if (leagues.length <= 3) {
    return (
      <Tabs value={selectedLeagueId} onValueChange={onLeagueChange} className={className}>
        <TabsList className={`grid w-full grid-cols-${leagues.length} mb-8`}>
          {leagues.map((league) => (
            <TabsTrigger key={league.id} value={league.id.toString()}>
              <span className="mr-2">{getLeagueLogo(league)}</span>
              {league.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    );
  }

  // More than 3 leagues: show first 3 as tabs + dropdown inside TabsList
  return (
    <Tabs
      value={isSelectedInDropdown ? '' : selectedLeagueId}
      onValueChange={onLeagueChange}
      className={`mb-8 ${className}`}
    >
      <TabsList className="grid w-full gap-1.5" style={{ gridTemplateColumns: `repeat(3, 1fr) auto` }}>
        {visibleLeagues.map((league) => (
          <TabsTrigger key={league.id} value={league.id.toString()}>
            <span className="mr-2">{getLeagueLogo(league)}</span>
            <span className="hidden sm:inline">{league.name}</span>
            <span className="sm:hidden">{league.name.substring(0, 3)}</span>
          </TabsTrigger>
        ))}

        {dropdownLeagues.length > 0 && (
          <div className="flex items-center px-1">
            <Select
              value={isSelectedInDropdown ? selectedLeagueId : ''}
              onValueChange={onLeagueChange}
            >
              <SelectTrigger className="h-full min-w-[140px] sm:min-w-[180px] border-0 bg-transparent hover:bg-white/50 dark:hover:bg-slate-950/50 data-[state=open]:bg-white dark:data-[state=open]:bg-slate-950">
                <SelectValue placeholder="More leagues...">
                  {isSelectedInDropdown && (
                    <div className="flex items-center gap-2">
                      {getLeagueLogo(
                        dropdownLeagues.find((l) => l.id.toString() === selectedLeagueId)!
                      )}
                      <span className="hidden sm:inline">
                        {dropdownLeagues.find((l) => l.id.toString() === selectedLeagueId)?.name}
                      </span>
                      <span className="sm:hidden">
                        {dropdownLeagues.find((l) => l.id.toString() === selectedLeagueId)?.name.substring(0, 3)}
                      </span>
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {dropdownLeagues.map((league) => (
                  <SelectItem key={league.id} value={league.id.toString()}>
                    <div className="flex items-center gap-2">
                      {getLeagueLogo(league)}
                      <span>{league.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </TabsList>
    </Tabs>
  );
}
