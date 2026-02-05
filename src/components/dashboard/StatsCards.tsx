import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, ShoppingCart, TrendingUp, Users } from "lucide-react";

interface StatsCardsProps {
  totalRevenue: number;
  totalSales: number;
  totalVisitors: number;
  conversionRate: number;
}

const StatsCards = ({ totalRevenue, totalSales, totalVisitors, conversionRate }: StatsCardsProps) => {
  const stats = [
    {
      label: "Receita Total",
      value: `$${totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: "text-green-400",
      bgColor: "bg-green-400/10",
    },
    {
      label: "Total de Vendas",
      value: totalSales.toString(),
      icon: ShoppingCart,
      color: "text-purple-400",
      bgColor: "bg-purple-400/10",
    },
    {
      label: "Visitantes Hoje",
      value: totalVisitors.toLocaleString(),
      icon: Users,
      color: "text-blue-400",
      bgColor: "bg-blue-400/10",
    },
    {
      label: "Taxa de Conversão",
      value: `${conversionRate.toFixed(2)}%`,
      icon: TrendingUp,
      color: "text-amber-400",
      bgColor: "bg-amber-400/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm text-slate-400">{stat.label}</p>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StatsCards;
