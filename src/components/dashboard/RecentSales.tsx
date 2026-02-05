import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DollarSign, Globe, Mail, Clock } from "lucide-react";

interface Sale {
  id: string;
  email: string | null;
  customer_name: string | null;
  amount_cents: number;
  currency: string;
  country_code: string | null;
  created_at: string;
  product_name: string | null;
}

interface RecentSalesProps {
  sales: Sale[];
}

// Country flag emoji from code
const getCountryFlag = (code: string | null) => {
  if (!code) return "🌍";
  const codePoints = code
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

const RecentSales = ({ sales }: RecentSalesProps) => {
  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-white flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-400" />
          Vendas Recentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {sales.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                Nenhuma venda registrada ainda
              </div>
            ) : (
              sales.map((sale) => (
                <div
                  key={sale.id}
                  className="p-3 bg-slate-700/30 rounded-lg border border-slate-600/50 hover:border-purple-500/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{getCountryFlag(sale.country_code)}</span>
                        <span className="text-sm font-medium text-white truncate">
                          {sale.customer_name || sale.email || "Cliente"}
                        </span>
                      </div>
                      {sale.email && (
                        <div className="flex items-center gap-1 text-xs text-slate-400 mb-1">
                          <Mail className="w-3 h-3" />
                          <span className="truncate">{sale.email}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                          <Globe className="w-3 h-3" />
                          <span>{sale.country_code || "N/A"}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>
                            {new Date(sale.created_at).toLocaleString("pt-BR", {
                              day: "2-digit",
                              month: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-green-400">
                        ${(sale.amount_cents / 100).toFixed(2)}
                      </span>
                      <div className="text-xs text-slate-500">{sale.currency}</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default RecentSales;
