import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Smartphone, Globe, TrendingUp, Clock, ArrowRight } from "lucide-react";

interface FunnelEvent {
  session_id: string;
  step: string;
  created_at: string;
  country_code: string | null;
  device_type: string | null;
  utm_source: string | null;
}

interface LeadBehaviorPanelProps {
  events: FunnelEvent[];
}

const LeadBehaviorPanel = ({ events }: LeadBehaviorPanelProps) => {
  // Calculate unique sessions
  const uniqueSessions = new Set(events.map(e => e.session_id)).size;

  // Device breakdown
  const deviceCounts = events.reduce((acc, e) => {
    const device = e.device_type || "unknown";
    acc[device] = (acc[device] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const deviceTotal = Object.values(deviceCounts).reduce((a, b) => a + b, 0);
  const deviceData = Object.entries(deviceCounts).map(([device, count]) => ({
    device,
    count,
    percentage: deviceTotal > 0 ? ((count / deviceTotal) * 100).toFixed(1) : 0,
  }));

  // Country breakdown (top 5)
  const countryCounts = events.reduce((acc, e) => {
    const country = e.country_code || "Desconhecido";
    acc[country] = (acc[country] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const countryData = Object.entries(countryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([country, count]) => ({
      country,
      count,
      percentage: events.length > 0 ? ((count / events.length) * 100).toFixed(1) : 0,
    }));

  // UTM Source breakdown
  const sourceCounts = events.reduce((acc, e) => {
    const source = e.utm_source || "Direto";
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sourceData = Object.entries(sourceCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([source, count]) => ({
      source,
      count,
      percentage: events.length > 0 ? ((count / events.length) * 100).toFixed(1) : 0,
    }));

  // Step journey analysis - group by session and see the path
  const sessionPaths = events.reduce((acc, e) => {
    if (!acc[e.session_id]) {
      acc[e.session_id] = [];
    }
    acc[e.session_id].push({ step: e.step, time: new Date(e.created_at).getTime() });
    return acc;
  }, {} as Record<string, { step: string; time: number }[]>);

  // Find common drop-off points
  const stepOrder = ["quiz", "id-player", "recharge", "checkout", "obrigado"];
  const lastStepCounts: Record<string, number> = {};

  Object.values(sessionPaths).forEach(path => {
    const sortedPath = path.sort((a, b) => a.time - b.time);
    const lastStep = sortedPath[sortedPath.length - 1]?.step;
    if (lastStep && lastStep !== "obrigado") {
      lastStepCounts[lastStep] = (lastStepCounts[lastStep] || 0) + 1;
    }
  });

  const dropOffData = Object.entries(lastStepCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([step, count]) => ({ step, count }));

  const stepLabels: Record<string, string> = {
    quiz: "Quiz",
    "id-player": "ID Player",
    recharge: "Recharge",
    checkout: "Checkout",
    obrigado: "Compra",
  };

  const deviceIcons: Record<string, string> = {
    mobile: "📱",
    desktop: "💻",
    tablet: "📲",
    unknown: "❓",
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Sessions Overview */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            Sessões Únicas (Hoje)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-white mb-2">{uniqueSessions}</div>
          <p className="text-sm text-slate-400">
            {events.length} eventos totais rastreados
          </p>
        </CardContent>
      </Card>

      {/* Device Breakdown */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-white flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-green-400" />
            Dispositivos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {deviceData.length > 0 ? deviceData.map(({ device, count, percentage }) => (
              <div key={device} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>{deviceIcons[device] || "❓"}</span>
                  <span className="text-slate-300 capitalize">{device}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white font-semibold">{count}</span>
                  <span className="text-xs text-slate-400">({percentage}%)</span>
                </div>
              </div>
            )) : (
              <p className="text-slate-400 text-sm">Sem dados ainda</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Top Countries */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-cyan-400" />
            Top Países
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {countryData.length > 0 ? countryData.map(({ country, count, percentage }) => (
              <div key={country} className="flex items-center justify-between">
                <span className="text-slate-300">{country}</span>
                <div className="flex items-center gap-2">
                  <span className="text-white font-semibold">{count}</span>
                  <span className="text-xs text-slate-400">({percentage}%)</span>
                </div>
              </div>
            )) : (
              <p className="text-slate-400 text-sm">Sem dados ainda</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Traffic Sources */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            Fontes de Tráfego
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {sourceData.length > 0 ? sourceData.map(({ source, count, percentage }) => (
              <div key={source} className="flex items-center justify-between">
                <span className="text-slate-300">{source}</span>
                <div className="flex items-center gap-2">
                  <span className="text-white font-semibold">{count}</span>
                  <span className="text-xs text-slate-400">({percentage}%)</span>
                </div>
              </div>
            )) : (
              <p className="text-slate-400 text-sm">Sem dados ainda</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Drop-off Analysis */}
      <Card className="bg-slate-800/50 border-slate-700 md:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" />
            Pontos de Abandono
          </CardTitle>
        </CardHeader>
        <CardContent>
          {dropOffData.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {dropOffData.map(({ step, count }) => (
                <div key={step} className="flex items-center gap-2 bg-slate-700/50 rounded-lg px-3 py-2">
                  <span className="text-slate-300">{stepLabels[step] || step}</span>
                  <ArrowRight className="w-4 h-4 text-red-400" />
                  <span className="text-red-400 font-semibold">{count} abandonos</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-sm">
              Sem dados de abandono ainda. Os leads que não chegaram até "Obrigado" aparecerão aqui.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LeadBehaviorPanel;
