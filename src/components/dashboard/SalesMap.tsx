import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface Sale {
  id: string;
  latitude: number | null;
  longitude: number | null;
  country_code: string | null;
  amount_cents: number;
  created_at: string;
  email: string | null;
}

interface SalesMapProps {
  sales: Sale[];
}

// Default coordinates for countries without lat/lng
const countryCoordinates: Record<string, [number, number]> = {
  US: [-95.7129, 37.0902],
  MX: [-102.5528, 23.6345],
  GT: [-90.2308, 15.7835],
  CA: [-106.3468, 56.1304],
  CO: [-74.2973, 4.5709],
  PE: [-75.0152, -9.19],
  EC: [-78.1834, -1.8312],
  DO: [-70.1627, 18.7357],
  CL: [-71.543, -35.6751],
  BR: [-51.9253, -14.235],
  AR: [-63.6167, -38.4161],
  VE: [-66.5897, 6.4238],
  PA: [-80.7821, 8.538],
  CR: [-83.7534, 9.7489],
  HN: [-86.2419, 15.2],
  SV: [-88.8965, 13.7942],
  NI: [-85.2072, 12.8654],
  BO: [-63.5887, -16.2902],
  PY: [-58.4438, -23.4425],
  UY: [-55.7658, -32.5228],
};

const SalesMap = ({ sales }: SalesMapProps) => {
  // Get coordinates for each sale
  const markers = sales
    .map((sale) => {
      let coords: [number, number] | null = null;
      
      if (sale.longitude && sale.latitude) {
        coords = [sale.longitude, sale.latitude];
      } else if (sale.country_code && countryCoordinates[sale.country_code]) {
        coords = countryCoordinates[sale.country_code];
      }
      
      if (!coords) return null;
      
      return {
        id: sale.id,
        coordinates: coords,
        amount: sale.amount_cents / 100,
        country: sale.country_code,
        email: sale.email,
        date: new Date(sale.created_at).toLocaleString("pt-BR"),
      };
    })
    .filter(Boolean);

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg text-white flex items-center gap-2">
          <MapPin className="w-5 h-5 text-purple-400" />
          Mapa de Vendas
        </CardTitle>
        <span className="text-sm text-slate-400">{markers.length} vendas</span>
      </CardHeader>
      <CardContent>
        <div className="relative h-[400px] w-full rounded-lg overflow-hidden bg-slate-900/50">
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{
              center: [-80, 10],
              scale: 250,
            }}
            style={{ width: "100%", height: "100%" }}
          >
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="#334155"
                    stroke="#475569"
                    strokeWidth={0.5}
                    style={{
                      default: { outline: "none" },
                      hover: { fill: "#475569", outline: "none" },
                      pressed: { outline: "none" },
                    }}
                  />
                ))
              }
            </Geographies>
            {markers.map((marker) => (
              <Marker key={marker!.id} coordinates={marker!.coordinates}>
                <circle
                  r={6}
                  fill="#a855f7"
                  stroke="#ffffff"
                  strokeWidth={2}
                  style={{ cursor: "pointer" }}
                />
                <circle
                  r={12}
                  fill="#a855f7"
                  fillOpacity={0.3}
                  className="animate-pulse"
                />
              </Marker>
            ))}
          </ComposableMap>
        </div>
        
        {/* Legend */}
        <div className="mt-4 flex items-center justify-center gap-4 text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500" />
            <span>Venda realizada</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SalesMap;
