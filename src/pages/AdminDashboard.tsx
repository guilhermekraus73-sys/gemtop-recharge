import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StatsCards from "@/components/dashboard/StatsCards";
import FunnelChart from "@/components/dashboard/FunnelChart";
import SalesMap from "@/components/dashboard/SalesMap";
import RecentSales from "@/components/dashboard/RecentSales";
import SalesChart from "@/components/dashboard/SalesChart";
import { LogOut, RefreshCw, Activity } from "lucide-react";

interface Sale {
  id: string;
  stripe_payment_intent_id: string;
  email: string | null;
  customer_name: string | null;
  amount_cents: number;
  currency: string;
  country_code: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  product_name: string | null;
  status: string;
}

interface FunnelStep {
  step: string;
  count: number;
  label: string;
}

const AdminDashboard = () => {
  const { user, loading, signOut } = useAdminAuth();
  const [sales, setSales] = useState<Sale[]>([]);
  const [funnelData, setFunnelData] = useState<FunnelStep[]>([]);
  const [todayVisitors, setTodayVisitors] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    setRefreshing(true);
    
    // Fetch sales
    const { data: salesData } = await supabase
      .from("sales")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (salesData) {
      setSales(salesData as Sale[]);
    }

    // Fetch funnel data for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: funnelRaw } = await supabase
      .from("funnel_events")
      .select("step")
      .gte("created_at", today.toISOString());

    if (funnelRaw) {
      // Count by step
      const stepCounts: Record<string, number> = {};
      funnelRaw.forEach((event) => {
        stepCounts[event.step] = (stepCounts[event.step] || 0) + 1;
      });

      // Order steps in funnel order
      const orderedSteps = ["quiz", "id-player", "recharge", "checkout", "obrigado"];
      const funnelArray = orderedSteps
        .filter((step) => stepCounts[step] !== undefined)
        .map((step) => ({
          step,
          count: stepCounts[step],
          label: step,
        }));

      setFunnelData(funnelArray);

      // Count unique sessions as visitors
      const uniqueSessions = new Set(funnelRaw.map((e: { step: string }) => e.step)).size;
      setTodayVisitors(funnelRaw.length);
    }

    setRefreshing(false);
  };

  useEffect(() => {
    if (!loading) {
      fetchData();

      // Set up realtime subscription for sales
      const salesChannel = supabase
        .channel("sales-realtime")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "sales" },
          (payload) => {
            setSales((prev) => [payload.new as Sale, ...prev]);
          }
        )
        .subscribe();

      // Set up realtime subscription for funnel events
      const funnelChannel = supabase
        .channel("funnel-realtime")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "funnel_events" },
          () => {
            fetchData(); // Refetch funnel data
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(salesChannel);
        supabase.removeChannel(funnelChannel);
      };
    }
  }, [loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
      </div>
    );
  }

  // Calculate stats
  const totalRevenue = sales
    .filter((s) => s.status === "succeeded")
    .reduce((sum, s) => sum + s.amount_cents / 100, 0);
  const totalSales = sales.filter((s) => s.status === "succeeded").length;
  const conversionRate = todayVisitors > 0 ? (totalSales / todayVisitors) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-600 rounded-lg">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Dashboard Analytics</h1>
              <p className="text-sm text-slate-400">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchData}
              disabled={refreshing}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              Atualizar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="text-slate-400 hover:text-white hover:bg-slate-700"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Stats Cards */}
        <StatsCards
          totalRevenue={totalRevenue}
          totalSales={totalSales}
          totalVisitors={todayVisitors}
          conversionRate={conversionRate}
        />

        {/* Tabs for different views */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="bg-slate-800/50 border border-slate-700">
            <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600">
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="map" className="data-[state=active]:bg-purple-600">
              Mapa
            </TabsTrigger>
            <TabsTrigger value="funnel" className="data-[state=active]:bg-purple-600">
              Funil
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4">
            <div className="space-y-6">
              <SalesChart sales={sales} />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SalesMap sales={sales} />
                <RecentSales sales={sales} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="map" className="mt-4">
            <SalesMap sales={sales} />
          </TabsContent>

          <TabsContent value="funnel" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <FunnelChart data={funnelData} />
              <RecentSales sales={sales} />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
