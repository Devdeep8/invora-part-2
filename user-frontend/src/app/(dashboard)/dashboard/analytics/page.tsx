'use client'
import { useState } from 'react'
import { useDashboard } from '@/components/dashboard/DashboardProvider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { BarChart3, TrendingUp } from 'lucide-react'
// recharts v3 custom tooltip props

type TimeRange = '7d' | '30d' | '90d'

function generateChartData(range: TimeRange) {
  const days = range === '7d' ? 7 : range === '30d' ? 30 : 90
  const now = new Date()
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(now)
    d.setDate(d.getDate() - (days - 1 - i))
    return {
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      clicks: Math.floor(Math.random() * 80 + 10),
    }
  })
}

const RANGE_LABELS: Record<TimeRange, string> = {
  '7d': '7 Days',
  '30d': '30 Days',
  '90d': '90 Days',
}

interface TooltipPayload { value?: number }

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: TooltipPayload[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold text-foreground">{payload[0].value} clicks</p>
    </div>
  )
}

export default function AnalyticsPage() {
  const { profiles } = useDashboard()
  const [range, setRange] = useState<TimeRange>('30d')
  const chartData = generateChartData(range)

  const topLinks = profiles.map((p, i) => ({
    title: p.name,
    slug: p.slug,
    clicks: Math.max(10, 500 - i * 80 + Math.floor(Math.random() * 60)),
    pct: 0,
  }))
  const maxClicks = Math.max(...topLinks.map((l) => l.clicks), 1)
  const tableRows = topLinks
    .map((l) => ({ ...l, pct: Math.round((l.clicks / maxClicks) * 100) }))
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 10)

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Analytics
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Track how your links are performing over time.
        </p>
      </div>

      {/* Time Range Filter */}
      <div className="flex items-center gap-1 p-1 bg-muted rounded-lg w-fit">
        {(Object.keys(RANGE_LABELS) as TimeRange[]).map((r) => (
          <Button
            key={r}
            size="sm"
            variant={range === r ? 'default' : 'ghost'}
            className={
              range === r
                ? 'h-8 bg-card text-foreground shadow-sm hover:bg-card transition-all duration-150'
                : 'h-8 text-muted-foreground hover:text-foreground transition-all duration-150'
            }
            onClick={() => setRange(r)}
          >
            {RANGE_LABELS[r]}
          </Button>
        ))}
      </div>

      {/* Area Chart */}
      <Card className="bg-card border-border shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold text-foreground">
                Link Clicks Over Time
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Total across all your profiles
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-1">
              <TrendingUp className="h-3 w-3" />
              +12%
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-2 pb-4">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="clicksGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0DFDC" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: '#6B7280' }}
                tickLine={false}
                axisLine={false}
                interval={range === '7d' ? 0 : range === '30d' ? 5 : 14}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#6B7280' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="clicks"
                stroke="#6366f1"
                strokeWidth={2.5}
                fill="url(#clicksGradient)"
                dot={false}
                activeDot={{ r: 4, fill: '#6366f1', strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Profiles Table */}
      <Card className="bg-card border-border shadow-sm">
        <CardHeader className="pb-4 border-b border-border">
          <CardTitle className="text-sm font-semibold text-foreground">Top Profiles by Clicks</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {tableRows.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No data yet. Create profiles and share them to see analytics.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="text-xs text-muted-foreground font-medium pl-5">Profile</TableHead>
                  <TableHead className="text-xs text-muted-foreground font-medium">Slug</TableHead>
                  <TableHead className="text-xs text-muted-foreground font-medium text-right pr-5">Clicks</TableHead>
                  <TableHead className="text-xs text-muted-foreground font-medium hidden sm:table-cell">Share</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tableRows.map((row, idx) => (
                  <TableRow key={idx} className="hover:bg-muted/50 transition-colors duration-100">
                    <TableCell className="pl-5 py-3">
                      <span className="text-sm font-medium text-foreground truncate max-w-[140px] block">
                        {row.title}
                      </span>
                    </TableCell>
                    <TableCell className="py-3">
                      <span className="text-xs text-muted-foreground">/{row.slug}</span>
                    </TableCell>
                    <TableCell className="py-3 text-right pr-5">
                      <span className="text-sm font-semibold text-foreground">{row.clicks.toLocaleString()}</span>
                    </TableCell>
                    <TableCell className="py-3 hidden sm:table-cell">
                      <div className="flex items-center gap-2 max-w-[120px]">
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all duration-500"
                            style={{ width: `${row.pct}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground w-8 text-right">{row.pct}%</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
