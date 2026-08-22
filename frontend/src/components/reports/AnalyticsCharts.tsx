import React from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { BarChart3, TrendingUp, PieChart as PieIcon, Layers } from 'lucide-react';
import { useAppDataStore } from '../../store/dataStore';

export function AnalyticsCharts() {
  const { employees, leaveRequests, attendance } = useAppDataStore();

  const attendanceBreakdown = [
    { name: 'Engineering', present: 96, halfDay: 3, leave: 1 },
    { name: 'Product', present: 92, halfDay: 5, leave: 3 },
    { name: 'People & Ops', present: 98, halfDay: 2, leave: 0 },
    { name: 'Operations', present: 94, halfDay: 4, leave: 2 },
  ];

  const leaveTrends = [
    { month: 'Mar', annual: 12, sick: 4, casual: 1 },
    { month: 'Apr', annual: 15, sick: 3, casual: 2 },
    { month: 'May', annual: 18, sick: 5, casual: 1 },
    { month: 'Jun', annual: 24, sick: 2, casual: 3 },
    { month: 'Jul', annual: 20, sick: 6, casual: 2 },
    { month: 'Aug', annual: 16, sick: 3, casual: 2 },
  ];

  const leaveDistribution = [
    { name: 'Annual / Vacation', value: 65, color: '#18181b' }, // Zinc 900
    { name: 'Sick / Medical', value: 25, color: '#71717a' }, // Zinc 500
    { name: 'Casual / Emergency', value: 10, color: '#d4d4d8' }, // Zinc 300
  ];

  const departmentPayroll = [
    { department: 'Engineering', spend: 48000, headcount: Math.max(1, employees.filter(e => e.department === 'Engineering').length) },
    { department: 'Product', spend: 28000, headcount: Math.max(1, employees.filter(e => e.department === 'Product').length) },
    { department: 'People & Ops', spend: 18000, headcount: Math.max(1, employees.filter(e => e.department === 'People & Ops').length) },
    { department: 'Operations', spend: 22000, headcount: Math.max(1, employees.filter(e => e.department === 'Operations').length) },
  ];

  return (
    <div className="space-y-6">
      {/* Top 2 charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Attendance Breakdown */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-sm font-bold text-zinc-900">
                <BarChart3 className="w-4 h-4 text-zinc-700" /> Attendance Rate by Department (%)
              </CardTitle>
              <Badge variant="success" size="sm">95.0% Org Average</Badge>
            </div>
            <p className="text-xs text-zinc-500">Current calendar month attendance breakdown</p>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#71717a' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#71717a' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    borderRadius: '1rem',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="present" name="Present %" fill="#18181b" radius={[6, 6, 0, 0]} />
                <Bar dataKey="halfDay" name="Half-Day %" fill="#71717a" radius={[6, 6, 0, 0]} />
                <Bar dataKey="leave" name="Leave %" fill="#d4d4d8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 6-Month Leave Request Trend */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-sm font-bold text-zinc-900">
                <TrendingUp className="w-4 h-4 text-zinc-700" /> 6-Month Leave Request Volume
              </CardTitle>
              <Badge variant="neutral" size="sm">Quarterly Trend</Badge>
            </div>
            <p className="text-xs text-zinc-500">Historical trend across leave categories</p>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={leaveTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#71717a' }} />
                <YAxis tick={{ fontSize: 11, fill: '#71717a' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    borderRadius: '1rem',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="annual" name="Annual" stroke="#18181b" strokeWidth={2.5} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="sick" name="Sick" stroke="#71717a" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="casual" name="Casual" stroke="#a1a1aa" strokeWidth={1.5} dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom 2 charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leave Category Distribution (Donut Chart) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-bold text-zinc-900">
              <PieIcon className="w-4 h-4 text-zinc-700" /> Leave Category Share
            </CardTitle>
            <p className="text-xs text-zinc-500">Distribution of all employee time-off requests</p>
          </CardHeader>
          <CardContent className="h-60 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={leaveDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {leaveDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    borderRadius: '1rem',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Department Payroll Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-bold text-zinc-900">
              <Layers className="w-4 h-4 text-zinc-700" /> Department Compensation Share
            </CardTitle>
            <p className="text-xs text-zinc-500">Monthly payroll spend by organizational division</p>
          </CardHeader>
          <CardContent className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentPayroll} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} horizontal={false} />
                <XAxis type="number" tickFormatter={(v) => `$${v / 1000}k`} tick={{ fontSize: 11, fill: '#71717a' }} />
                <YAxis dataKey="department" type="category" tick={{ fontSize: 11, fill: '#71717a' }} width={85} />
                <Tooltip
                  formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Monthly Spend']}
                  contentStyle={{
                    backgroundColor: '#18181b',
                    borderRadius: '1rem',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="spend" fill="#18181b" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
