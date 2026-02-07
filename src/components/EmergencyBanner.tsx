'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Phone, MapPin, ChevronDown, ChevronUp, Search } from 'lucide-react';
import BUILDING_MAP from '@/lib/building-mappings.json';

interface FrontDesk {
  name: string;
  latitude: number;
  longitude: number;
  phone: string;
  buildings: string[];
}

const FRONT_DESKS: FrontDesk[] = [
  { name: 'Hill Community Front Desk', latitude: 33.9594, longitude: -83.3759, phone: '(706) 542-5979', buildings: ['Boggs Hall', 'Church Hall', 'Hill Hall', 'Lipscomb Hall', 'Mary Lyndon Hall', 'Mell Hall', 'Morris Hall'] },
  { name: 'Creswell Community Front Desk', latitude: 33.9468, longitude: -83.3738, phone: '(706) 542-1662', buildings: ['Creswell Hall', 'Russell Hall'] },
  { name: 'Myers Community Front Desk', latitude: 33.9530, longitude: -83.3748, phone: '(706) 542-1622', buildings: ['Myers Hall', 'Soule Hall'] },
  { name: 'Reed Community Front Desk', latitude: 33.9500, longitude: -83.3778, phone: '(706) 542-3476', buildings: ['Reed Hall', 'Payne Hall'] },
  { name: 'Brumby Community Front Desk', latitude: 33.9512, longitude: -83.3802, phone: '(706) 542-1632', buildings: ['Brumby Hall'] },
  { name: 'Oglethorpe Community Front Desk', latitude: 33.9488, longitude: -83.3770, phone: '(706) 542-1691', buildings: ['Oglethorpe House'] },
  { name: 'Rutherford Community Front Desk', latitude: 33.9507, longitude: -83.3792, phone: '(706) 542-3014', buildings: ['Rutherford Hall'] },
  { name: 'Busbee Community Front Desk', latitude: 33.9518, longitude: -83.3798, phone: '(706) 542-7052', buildings: ['Busbee Hall'] },
  { name: 'ECV Community Front Desk', latitude: 33.9458, longitude: -83.3680, phone: '(706) 542-8301', buildings: ['Vandiver Hall', 'Rooker Hall', 'McWhorter Hall'] },
  { name: 'Brown Community Front Desk', latitude: 33.9472, longitude: -83.3742, phone: '(706) 542-4091', buildings: ['Brown Hall'] },
  { name: 'Highland Community Front Desk', latitude: 33.9435, longitude: -83.3815, phone: '(706) 542-5595', buildings: ['Highland'] },
  { name: 'University Village Front Desk', latitude: 33.9400, longitude: -83.3845, phone: '(706) 542-4840', buildings: ['University Village'] },
  { name: 'Rogers Road Community Front Desk', latitude: 33.9392, longitude: -83.3855, phone: '(706) 542-5350', buildings: ['Rogers Road'] },
];

interface EmergencyBannerProps {
  onRequestSchedule?: () => void;
}

export function EmergencyBanner({ onRequestSchedule }: EmergencyBannerProps) {
  const [closestDesk, setClosestDesk] = useState<FrontDesk | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [buildingInput, setBuildingInput] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude: lat, longitude: lon } = pos.coords;
          let closest = FRONT_DESKS[0];
          let minDist = dist(lat, lon, closest.latitude, closest.longitude);
          for (const desk of FRONT_DESKS) {
            const d = dist(lat, lon, desk.latitude, desk.longitude);
            if (d < minDist) { minDist = d; closest = desk; }
          }
          setClosestDesk(closest);
        },
        () => setClosestDesk(FRONT_DESKS[0]),
      );
    }
  }, []);

  const dist = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 3959;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const handleBuildingSearch = () => {
    const name = buildingInput.trim().toLowerCase();
    if (!name) return;
    const mapped = (BUILDING_MAP as Record<string, string>)[name];
    if (mapped) {
      const desk = FRONT_DESKS.find((d) => d.name === mapped);
      if (desk) { setClosestDesk(desk); setFeedback(`✓ ${desk.name}`); setTimeout(() => setFeedback(null), 4000); return; }
    }
    let match = FRONT_DESKS.find((d) => d.buildings.some((b) => b.toLowerCase().includes(name)));
    if (match) { setClosestDesk(match); setFeedback(`✓ ${match.name}`); }
    else setFeedback('Not found — try the full hall name');
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <div className="bg-amber-50 border border-amber-300 rounded-lg overflow-hidden">
      {/* Collapsed warning tag */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between gap-2 px-4 py-2.5 text-left hover:bg-amber-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span className="text-sm font-semibold text-amber-800">
            Emergency? <span className="font-normal text-amber-700">911</span>
            <span className="mx-1.5 text-amber-400">|</span>
            UGA Police <span className="font-normal text-amber-700">(706) 542-2200</span>
            {closestDesk && (
              <>
                <span className="mx-1.5 text-amber-400">|</span>
                <span className="font-normal text-amber-700">{closestDesk.name.replace(' Front Desk', '')} {closestDesk.phone}</span>
              </>
            )}
          </span>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-amber-600" /> : <ChevronDown className="w-4 h-4 text-amber-600" />}
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-amber-200 px-4 py-3 space-y-3">
          {/* 911 */}
          <a href="tel:911" className="flex items-center gap-3 p-2.5 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors">
            <Phone className="w-4 h-4 text-red-700" />
            <div>
              <p className="text-sm font-bold text-red-800">Call 911</p>
              <p className="text-xs text-red-600">Life-threatening emergency</p>
            </div>
          </a>

          {/* UGA Police */}
          <a href="tel:7065422200" className="flex items-center gap-3 p-2.5 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
            <Phone className="w-4 h-4 text-blue-700" />
            <div>
              <p className="text-sm font-bold text-blue-800">UGA Police — (706) 542-2200</p>
              <p className="text-xs text-blue-600">Non-emergency campus safety</p>
            </div>
          </a>

          {/* Front Desk */}
          {closestDesk && (
            <a href={`tel:${closestDesk.phone.replace(/[^0-9]/g, '')}`} className="flex items-center gap-3 p-2.5 bg-amber-100 border border-amber-300 rounded-lg hover:bg-amber-200 transition-colors">
              <MapPin className="w-4 h-4 text-amber-700" />
              <div>
                <p className="text-sm font-bold text-amber-900">{closestDesk.name} — {closestDesk.phone}</p>
                <p className="text-xs text-amber-700">Housing issues · Serves: {closestDesk.buildings.join(', ')}</p>
              </div>
            </a>
          )}

          {/* Building search */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-amber-500" />
              <input
                value={buildingInput}
                onChange={(e) => setBuildingInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleBuildingSearch()}
                placeholder="Find your dorm's front desk..."
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-amber-300 rounded bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-amber-500"
              />
            </div>
            <button onClick={handleBuildingSearch} className="px-3 py-1.5 text-sm bg-amber-600 text-white rounded hover:bg-amber-700 font-medium">Find</button>
          </div>
          {feedback && <p className="text-xs text-amber-700">{feedback}</p>}

          {onRequestSchedule && (
            <button onClick={onRequestSchedule} className="w-full text-xs text-amber-700 hover:text-amber-900 underline text-center py-1">
              Schedule time with an RA
            </button>
          )}
        </div>
      )}
    </div>
  );
}
