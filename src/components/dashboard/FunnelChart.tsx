import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingDown } from "lucide-react";

interface FunnelStep {
  step: string;
  count: number;
  label: string;
}

interface FunnelChartProps {
  data: FunnelStep[];
}

const stepLabels: Record<string, string> = {
  quiz: "Quiz",
  "id-player": "ID Player",
  recharge: "Recharge",
  checkout: "Checkout",
  obrigado: "Compra",
};

const FunnelChart = ({ data }: FunnelChartProps) => {
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-white flex items-center gap-2">
          <TrendingDown className="w-5 h-5 text-purple-400" />
          Funil de Conversão
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((item, index) => {
            const percentage = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
            const conversionRate = index > 0 && data[index - 1].count > 0
              ? ((item.count / data[index - 1].count) * 100).toFixed(1)
              : "100";

            return (
              <div key={item.step} className="relative">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-slate-300">
                    {stepLabels[item.step] || item.step}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white font-semibold">
                      {item.count.toLocaleString()}
                    </span>
                    {index > 0 && (
                      <span className="text-xs text-slate-400">
                        ({conversionRate}%)
                      </span>
                    )}
                  </div>
                </div>
                <div className="h-8 bg-slate-700/50 rounded-lg overflow-hidden relative">
                  <div
                    className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-lg transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Overall conversion rate */}
        {data.length >= 2 && (
          <div className="mt-4 pt-4 border-t border-slate-700">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Taxa de Conversão Total</span>
              <span className="text-lg font-bold text-purple-400">
                {data[0].count > 0
                  ? ((data[data.length - 1].count / data[0].count) * 100).toFixed(2)
                  : 0}%
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FunnelChart;
