import React, { useState, useEffect } from 'react';
import { useAttendance } from '../../hooks/useAttendance';
import { Button } from '../ui/Button';
import { toast } from '../ui/Toast';
import { Clock, LogIn, LogOut, CheckCircle, MapPin, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { formatTimeString } from '../../lib/utils';

export function CheckInOutButton() {
  const { todayRecord, isCheckedIn, isCheckedOut, checkIn, checkOut, isCheckInLoading, isCheckOutLoading } = useAttendance();
  const [elapsedTime, setElapsedTime] = useState('00:00:00');

  // Elapsed timer when checked in
  useEffect(() => {
    if (!isCheckedIn || !todayRecord?.checkIn) return;

    const calculateElapsed = () => {
      const start = new Date(todayRecord.checkIn!).getTime();
      const now = new Date().getTime();
      const diff = Math.max(0, now - start);

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setElapsedTime(
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      );
    };

    calculateElapsed();
    const timer = setInterval(calculateElapsed, 1000);
    return () => clearInterval(timer);
  }, [isCheckedIn, todayRecord?.checkIn]);

  const handleAction = async () => {
    try {
      if (!todayRecord?.checkIn) {
        // Punch In
        await checkIn('San Francisco Hub / Remote');
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
        });
        toast('Checked In Successfully', 'Your work shift has started at ' + formatTimeString(new Date().toISOString()), 'success');
      } else if (isCheckedIn) {
        // Punch Out
        await checkOut();
        confetti({
          particleCount: 70,
          spread: 70,
          origin: { y: 0.8 },
        });
        toast('Shift Completed', 'Great work today! Check-out timestamp recorded.', 'info');
      }
    } catch (err: any) {
      toast('Attendance Error', err.message || 'Failed to update attendance', 'error');
    }
  };

  if (isCheckedOut) {
    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 backdrop-blur-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-base font-bold text-slate-900 dark:text-white">Day Complete</h4>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                {todayRecord.workHours || 8} hrs logged
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              In: {formatTimeString(todayRecord.checkIn)} • Out: {formatTimeString(todayRecord.checkOut)}
            </p>
          </div>
        </div>

        <Button variant="outline" size="sm" disabled className="opacity-75 cursor-not-allowed">
          Shift Done for Today
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-white/80 dark:border-slate-800/80 backdrop-blur-xl shadow-lg shadow-indigo-500/5">
      <div className="flex items-center gap-3.5 w-full sm:w-auto">
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
            isCheckedIn
              ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 animate-pulse'
              : 'bg-indigo-600/10 text-indigo-600 dark:text-indigo-400'
          }`}
        >
          <Clock className="w-6 h-6" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              {isCheckedIn ? 'Active Work Shift' : 'Punch Attendance'}
            </h4>
            {isCheckedIn && (
              <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 animate-pulse">
                In Progress
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            {isCheckedIn
              ? `Started at ${formatTimeString(todayRecord?.checkIn)} (${elapsedTime})`
              : 'Not punched in yet today'}
          </p>
        </div>
      </div>

      <div className="w-full sm:w-auto">
        {isCheckedIn ? (
          <Button
            variant="danger"
            size="md"
            onClick={handleAction}
            isLoading={isCheckOutLoading}
            className="w-full sm:w-auto gap-2"
          >
            <LogOut className="w-4 h-4" /> Check Out Shift
          </Button>
        ) : (
          <Button
            variant="primary"
            size="md"
            onClick={handleAction}
            isLoading={isCheckInLoading}
            className="w-full sm:w-auto gap-2"
          >
            <LogIn className="w-4 h-4" /> Check In Now
          </Button>
        )}
      </div>
    </div>
  );
}
