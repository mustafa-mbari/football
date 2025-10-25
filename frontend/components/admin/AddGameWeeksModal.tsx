'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface GameWeekFormData {
  weekNumber: string;
  startDate: string;
  endDate: string;
  status: string;
}

interface AddGameWeeksModalProps {
  isOpen: boolean;
  onClose: () => void;
  leagueId: number;
  onSuccess: () => void;
}

const STATUSES = [
  { value: 'SCHEDULED', label: 'Scheduled' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'POSTPONED', label: 'Postponed' },
];

export default function AddGameWeeksModal({
  isOpen,
  onClose,
  leagueId,
  onSuccess,
}: AddGameWeeksModalProps) {
  const [numberOfWeeks, setNumberOfWeeks] = useState<number>(1);
  const [gameweeks, setGameweeks] = useState<GameWeekFormData[]>([
    { weekNumber: '', startDate: '', endDate: '', status: 'SCHEDULED' },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setNumberOfWeeks(1);
      setGameweeks([
        { weekNumber: '', startDate: '', endDate: '', status: 'SCHEDULED' },
      ]);
      setErrors([]);
    }
  }, [isOpen]);

  const handleNumberOfWeeksChange = (value: number) => {
    const num = Math.max(1, Math.min(50, value)); // Between 1 and 50
    setNumberOfWeeks(num);

    // Adjust gameweeks array
    const newGameweeks = Array.from({ length: num }, (_, i) => {
      if (gameweeks[i]) {
        return gameweeks[i];
      }
      return { weekNumber: '', startDate: '', endDate: '', status: 'SCHEDULED' };
    });
    setGameweeks(newGameweeks);
  };

  const handleGameweekChange = (
    index: number,
    field: keyof GameWeekFormData,
    value: string
  ) => {
    const updated = [...gameweeks];
    updated[index] = { ...updated[index], [field]: value };
    setGameweeks(updated);
  };

  const validateForm = (): boolean => {
    const validationErrors: string[] = [];

    gameweeks.forEach((gw, index) => {
      if (!gw.weekNumber || gw.weekNumber.trim() === '') {
        validationErrors.push(`Week ${index + 1}: Week number is required`);
      }

      // Check for duplicate week numbers
      const duplicates = gameweeks.filter(
        (g, i) => i !== index && g.weekNumber === gw.weekNumber && gw.weekNumber !== ''
      );
      if (duplicates.length > 0) {
        validationErrors.push(`Week ${index + 1}: Duplicate week number ${gw.weekNumber}`);
      }
    });

    setErrors(validationErrors);
    return validationErrors.length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors([]);

    try {
      const response = await fetch('http://localhost:7070/api/gameweeks/create', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          leagueId,
          gameweeks: gameweeks.map((gw) => ({
            weekNumber: parseInt(gw.weekNumber),
            startDate: gw.startDate || undefined,
            endDate: gw.endDate || undefined,
            status: gw.status,
          })),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message || 'Gameweek(s) created successfully!');
        onSuccess();
        onClose();
      } else {
        if (data.errors && Array.isArray(data.errors)) {
          setErrors(data.errors);
        } else {
          setErrors([data.message || 'Failed to create gameweek(s)']);
        }
      }
    } catch (error) {
      console.error('Error creating gameweeks:', error);
      setErrors(['An error occurred while creating gameweek(s)']);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add GameWeek(s)</DialogTitle>
          <DialogDescription>
            Create one or multiple gameweeks for the selected league
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Number of Weeks Input */}
          <div className="space-y-2">
            <Label htmlFor="numberOfWeeks">Number of Weeks to Create</Label>
            <Input
              id="numberOfWeeks"
              type="number"
              min="1"
              max="50"
              value={numberOfWeeks}
              onChange={(e) => handleNumberOfWeeksChange(parseInt(e.target.value) || 1)}
              className="w-32"
            />
          </div>

          {/* Error Messages */}
          {errors.length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
              <h4 className="text-sm font-semibold text-red-800 dark:text-red-200 mb-2">
                Please fix the following errors:
              </h4>
              <ul className="list-disc list-inside text-sm text-red-700 dark:text-red-300 space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Gameweek Forms */}
          <div className="space-y-4">
            {gameweeks.map((gw, index) => (
              <div
                key={index}
                className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 space-y-4"
              >
                <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
                  Gameweek {index + 1}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Week Number */}
                  <div className="space-y-2">
                    <Label htmlFor={`weekNumber-${index}`}>
                      Week Number <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id={`weekNumber-${index}`}
                      type="number"
                      min="1"
                      placeholder="e.g., 1"
                      value={gw.weekNumber}
                      onChange={(e) =>
                        handleGameweekChange(index, 'weekNumber', e.target.value)
                      }
                      required
                    />
                  </div>

                  {/* Start Date */}
                  <div className="space-y-2">
                    <Label htmlFor={`startDate-${index}`}>Start Date</Label>
                    <Input
                      id={`startDate-${index}`}
                      type="datetime-local"
                      value={gw.startDate}
                      onChange={(e) =>
                        handleGameweekChange(index, 'startDate', e.target.value)
                      }
                    />
                  </div>

                  {/* End Date */}
                  <div className="space-y-2">
                    <Label htmlFor={`endDate-${index}`}>End Date</Label>
                    <Input
                      id={`endDate-${index}`}
                      type="datetime-local"
                      value={gw.endDate}
                      onChange={(e) =>
                        handleGameweekChange(index, 'endDate', e.target.value)
                      }
                    />
                  </div>

                  {/* Status */}
                  <div className="space-y-2">
                    <Label htmlFor={`status-${index}`}>Status</Label>
                    <Select
                      value={gw.status}
                      onValueChange={(value) =>
                        handleGameweekChange(index, 'status', value)
                      }
                    >
                      <SelectTrigger id={`status-${index}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting
                ? 'Creating...'
                : `Create ${numberOfWeeks} Gameweek${numberOfWeeks > 1 ? 's' : ''}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
