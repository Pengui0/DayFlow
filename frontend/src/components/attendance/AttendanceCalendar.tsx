import React, { useState } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  getDay,
} from 'date-fns';
import { AttendanceRecord } from '../../types/attendance';
import { ChevronLeft, ChevronRight, Clock, MapPin, CheckCircle2, AlertCircle } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { formatDateString, formatTimeString } from '../../lib/utils';

interface AttendanceCalendarProps {
  records: AttendanceRecord[];
}

export function AttendanceCalendar({ records }: AttendanceCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDayRecord, setSelectedDayRecord] = useState<{
    date: Date;
    record?: AttendanceRecord;
  } | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = getDay(monthStart); // 0 (Sun) to 6 (Sat)

  const getRecordForDate = (d: Date) => {
    const dateStr = format(d, 'yyyy-MM-dd');
    return records.find((r) => r.date === dateStr);
  };

  const getDayStatusColor = (d: Date) => {
    const rec = getRecordForDate(d);
    const dayOfWeek = d.getDay();

    if (!rec) {
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        return 'bg-slate-100/50 dark:bg-slate-800/30 text-slate-400 border-transparent';
      }
      return 'bg-white/40 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300 border-slate-200/50 dark:border-slate-800/50';
    }

    switch (rec.status) {
      case 'present':
        return 'bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/25';
      case 'half-day':
        return 'bg-amber-500/15 border-amber-500/40 text-amber-700 dark:text-amber-300 hover:bg-amber-500/25';
      case 'leave':
        return 'bg-purple-500/15 border-purple-500/40 text-purple-700 dark:text-purple-300 hover:bg-purple-500/25';
      case 'absent':
        return 'bg-rose-500/15 border-rose-500/40 text-rose-700 dark:text-rose-300 hover:bg-rose-500/25';
      default:
        return 'bg-white/40 dark:bg-slate-900/40 border-slate-200/50';
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/80 dark:border-slate-800/80 shadow-xs space-y-6">
      {/* Calendar Header & Month Navigation */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {format(currentMonth, 'MMMM yyyy')}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Click on any day cell to view attendance details & work shift hours
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-2 rounded-2xl bg-white/80 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700/80 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentMonth(new Date())}
            className="px-3 py-1.5 rounded-2xl bg-white/80 dark:bg-slate-800/80 hover:bg-slate-100 text-xs font-semibold border border-slate-200/80 dark:border-slate-700/80 transition-colors"
          >
            Today
          </button>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-2 rounded-2xl bg-white/80 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700/80 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 flex-wrap text-xs font-medium">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-emerald-500/40 border border-emerald-500" />
          <span className="text-slate-600 dark:text-slate-400">Present (Full Day)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-amber-500/40 border border-amber-500" />
          <span className="text-slate-600 dark:text-slate-400">Half-Day</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-purple-500/40 border border-purple-500" />
          <span className="text-slate-600 dark:text-slate-400">On Leave / Vacation</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-rose-500/40 border border-rose-500" />
          <span className="text-slate-600 dark:text-slate-400">Absent</span>
        </div>
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div
            key={d}
            className="text-center text-[11px] font-bold uppercase tracking-wider text-slate-400 py-1"
          >
            {d}
          </div>
        ))}

        {/* Empty padding cells for start of month */}
        {Array.from({ length: startDayOfWeek }).map((_, idx) => (
          <div key={`empty-${idx}`} className="h-20 rounded-2xl bg-transparent" />
        ))}

        {/* Day Cells */}
        {days.map((day) => {
          const rec = getRecordForDate(day);
          const isToday = isSameDay(day, new Date());

          return (
            <button
              key={day.toISOString()}
              onClick={() => setSelectedDayRecord({ date: day, record: rec })}
              className={`h-20 p-2 rounded-2xl border text-left flex flex-col justify-between transition-all duration-200 relative group cursor-pointer ${getDayStatusColor(
                day
              )} ${isToday ? 'ring-2 ring-indigo-500 shadow-md' : ''}`}
            >
              <div className="flex items-center justify-between w-full">
                <span
                  className={`text-xs font-bold ${
                    isToday
                      ? 'w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center'
                      : ''
                  }`}
                >
                  {format(day, 'd')}
                </span>
                {rec?.status && (
                  <span className="text-[10px] uppercase font-bold tracking-tight opacity-75">
                    {rec.status}
                  </span>
                )}
              </div>

              {rec ? (
                <div className="text-[10px] font-medium leading-tight">
                  <div className="truncate font-mono">
                    {formatTimeString(rec.checkIn)} - {formatTimeString(rec.checkOut)}
                  </div>
                  {rec.workHours && (
                    <div className="text-[9px] font-bold opacity-80">{rec.workHours} hrs</div>
                  )}
                </div>
              ) : (
                <div className="text-[10px] text-slate-400 font-normal">--</div>
              )}
            </button>
          );
        })}
      </div>

      {/* Day Details Modal */}
      <Modal
        isOpen={Boolean(selectedDayRecord)}
        onClose={() => setSelectedDayRecord(null)}
        title={selectedDayRecord ? format(selectedDayRecord.date, 'EEEE, MMMM d, yyyy') : ''}
        description="Daily Work Shift & Timestamp Log"
        maxWidth="sm"
      >
        {selectedDayRecord && (
          <div className="space-y-4 pt-2">
            {selectedDayRecord.record ? (
              <>
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-xs text-slate-500">Shift Status</span>
                  <Badge variant={selectedDayRecord.record.status === 'present' ? 'success' : 'warning'}>
                    {selectedDayRecord.record.status.toUpperCase()}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-indigo-500" /> Punch In
                    </span>
                    <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                      {formatTimeString(selectedDayRecord.record.checkIn)}
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-indigo-500" /> Punch Out
                    </span>
                    <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                      {formatTimeString(selectedDayRecord.record.checkOut)}
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-indigo-500" /> Work Location / Notes
                  </span>
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mt-1">
                    {selectedDayRecord.record.location || selectedDayRecord.record.notes || 'HQ Office - San Francisco'}
                  </p>
                </div>
              </>
            ) : (
              <div className="p-6 text-center text-xs text-slate-500">
                No attendance or punch events recorded for this date.
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
