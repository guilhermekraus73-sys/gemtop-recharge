import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { useMemo } from "react";
import { format, startOfHour, startOfDay, parseISO, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Sale {
  id: string;
  amount_cents: number;
  created_at: string;
  status: string;
}

interface SalesChartProps {
  sales: Sale[];
}

const SalesChart = ({ sales }: SalesChartProps) => {
  const successfulSales = sales.filter((s) => s.status === "succeeded");

  // Group sales by hour (last 24 hours)
  const hourlyData = useMemo(() => {
    const now = new Date();
    const hours: Record<string, { time: string; revenue: number; count: number }> = {};

    // Initialize last 24 hours
    for (let i = 23; i >= 0; i--) {
      const hour = new Date(now);
      hour.setHours(hour.getHours() - i, 0, 0, 0);
      const key = format(hour, "HH:00");
      hours[key] = { time: key, revenue: 0, count: 0 };
    }

    // Fill with actual sales
    successfulSales.forEach((sale) => {
      const saleDate = parseISO(sale.created_at);
      const hourKey = format(startOfHour(saleDate), "HH:00");
      if (hours[hourKey]) {
        hours[hourKey].revenue += sale.amount_cents / 100;
        hours[hourKey].count += 1;
      }
    });

    return Object.values(hours);
  }, [successfulSales]);

  // Group sales by day (last 7 days)
  const dailyData = useMemo(() => {
    const days: Record<string, { time: string; revenue: number; count: number }> = {};

    // Initialize last 7 days
    for (let i = 6; i >= 0; i--) {
      const day = subDays(new Date(), i);
      const key = format(startOfDay(day), "yyyy-MM-dd");
      const label = format(day, "EEE", { locale: ptBR });
      days[key] = { time: label, revenue: 0, count: 0 };
    }

    // Fill with actual sales
    successfulSales.forEach((sale) => {
      const saleDate = parseISO(sale.created_at);
      const dayKey = format(startOfDay(saleDate), "yyyy-MM-dd");
      if (days[dayKey]) {
        days[dayKey].revenue += sale.amount_cents / 100;
        days[dayKey].count += 1;
      }
    });

    return Object.values(days);
  }, [successfulSales]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-lg">
          <p className="text-slate-300 text-sm font-medium">{label}</p>
          <p className="text-green-400 text-lg font-bold">
            ${payload[0].value.toFixed(2)}
          </p>
          {payload[1] && (
            <p className="text-purple-400 text-sm">
              {payload[1].value} vendas
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader className="pb-2">
        <CardTitle className="text-white text-lg">Vendas por Período</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="hourly" className="w-full">
          <TabsList className="bg-slate-700/50 border border-slate-600 mb-4">
            <TabsTrigger
              value="hourly"
              className="data-[state=active]:bg-purple-600 text-slate-300 data-[state=active]:text-white"
            >
              Por Hora (24h)
            </TabsTrigger>
            <TabsTrigger
              value="daily"
              className="data-[state=active]:bg-purple-600 text-slate-300 data-[state=active]:text-white"
            >
              Por Dia (7d)
            </TabsTrigger>
          </TabsList>

          <TabsContent value="hourly" className="mt-0">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourlyData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey="time"
                    stroke="#9ca3af"
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#9ca3af"
                    fontSize={12}
                    tickLine={false}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#a855f7"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="daily" className="mt-0">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey="time"
                    stroke="#9ca3af"
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#9ca3af"
                    fontSize={12}
                    tickLine={false}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="revenue"
                    fill="#a855f7"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SalesChart;
