import React, { useState, useEffect } from 'react';
import { useAttendance } from '../../hooks/useAttendance';
import { Button } from '../ui/Button';
import { toast } from '../ui/Toast';
import { Clock, LogIn, LogOut, CheckCircle2, MapPin } from 'lucide-react';
import confetti from 'canvas-confetti';
import { formatTimeString } from '../../lib/utils';

export function LivePunchClock() {
  const { todayRecord, isCheckedIn, isCheckedOut, checkIn, checkOut, isCheckInLoading, isCheckOutLoading } = useAttendance();
  const [elapsedTime, setElapsedTime] = useState('00:00:00');

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
        await checkIn('Main Office');
        confetti({ particleCount: 40, spread: 50, origin: { y: 0.8 } });
        toast('Shift Started', 'You are clocked in for today.', 'success');
      } else if (isCheckedIn) {
        await checkOut();
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
        toast('Shift Completed', 'Clock-out recorded. Great work today!', 'info');
      }
    } catch (err: any) {
      toast('Attendance Error', err.message || 'Failed to update shift', 'error');
    }
  };

  if (isCheckedOut) {
    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-white border border-emerald-500/20 shadow-[0_2px_16px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-zinc-900">Shift Completed</h4>
              <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {todayRecord.workHours || 8} hrs logged
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              In: {formatTimeString(todayRecord.checkIn)} • Out: {formatTimeString(todayRecord.checkOut)}
            </p>
          </div>
        </div>

        <Button variant="outline" size="sm" disabled className="text-xs">
          Shift Done for Today
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-white border border-black/[0.05] shadow-[0_2px_16px_rgba(0,0,0,0.03)]">
      <div className="flex items-center gap-3.5 w-full sm:w-auto">
        <div
          className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
            isCheckedIn
              ? 'bg-amber-50 text-amber-700 ring-4 ring-amber-50/50'
              : 'bg-zinc-100 text-zinc-700'
          }`}
        >
          <Clock className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-zinc-900">
              {isCheckedIn ? 'Live Shift Session' : 'Ready to begin?'}
            </h4>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider ${
                isCheckedIn
                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                  : 'bg-zinc-100 text-zinc-600'
              }`}
            >
              {isCheckedIn ? 'Active' : 'Offline'}
            </span>
          </div>

          <p className="text-xs text-zinc-500 mt-0.5 flex items-center gap-1.5">
            <MapPin className="w-3 h-3 text-zinc-400" />
            {isCheckedIn ? `Punched in at ${formatTimeString(todayRecord?.checkIn)}` : 'Main Office / Remote'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
        {isCheckedIn && (
          <div className="text-right pr-2">
            <span className="text-[10px] uppercase font-semibold text-zinc-400 block tracking-wider">
              Elapsed Time
            </span>
            <span className="text-base font-mono font-bold text-zinc-900">
              {elapsedTime}
            </span>
          </div>
        )}

        <Button
          onClick={handleAction}
          variant={isCheckedIn ? 'danger' : 'primary'}
          size="md"
          isLoading={isCheckInLoading || isCheckOutLoading}
          className="gap-2 text-xs sm:text-sm px-5"
        >
          {isCheckedIn ? (
            <>
              <LogOut className="w-4 h-4" /> Clock Out
            </>
          ) : (
            <>
              <LogIn className="w-4 h-4" /> Clock In Now
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
