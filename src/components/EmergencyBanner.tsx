'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Phone, X, MapPin, ShieldAlert } from 'lucide-react';
import BUILDING_MAP from '@/lib/building-mappings.json';

interface FrontDesk {
  name: string;
  latitude: number;
  longitude: number;
  phone: string;
  buildings: string[];
}

// Complete list of UGA front desks with accurate phone numbers
const FRONT_DESKS: FrontDesk[] = [
  {
    name: 'Hill Community Front Desk',
    latitude: 33.9556,
    longitude: -83.3774,
    phone: '(706) 542-5979',
    buildings: ['Boggs Hall', 'Church Hall', 'Hill Hall', 'Lipscomb Hall', 'Mary Lyndon Hall', 'Mell Hall', 'Morris Hall'],
  },
  {
    name: 'Creswell Community Front Desk',
    latitude: 33.9535,
    longitude: -83.3760,
    phone: '(706) 542-1662',
    buildings: ['Creswell Hall', 'Russell Hall'],
  },
  {
    name: 'Myers Community Front Desk',
    latitude: 33.9545,
    longitude: -83.3770,
    phone: '(706) 542-1622',
    buildings: ['Myers Hall', 'Soule Hall'],
  },
  {
    name: 'Reed Community Front Desk',
    latitude: 33.9525,
    longitude: -83.3765,
    phone: '(706) 542-3476',
    buildings: ['Reed Hall', 'Payne Hall'],
  },
  {
    name: 'Brumby Community Front Desk',
    latitude: 33.9505,
    longitude: -83.3750,
    phone: '(706) 542-1632',
    buildings: ['Brumby Hall'],
  },
  {
    name: 'Oglethorpe Community Front Desk',
    latitude: 33.9480,
    longitude: -83.3735,
    phone: '(706) 542-1691',
    buildings: ['Oglethorpe House'],
  },
  {
    name: 'Rutherford Community Front Desk',
    latitude: 33.9490,
    longitude: -83.3745,
    phone: '(706) 542-3014',
    buildings: ['Rutherford Hall'],
  },
  {
    name: 'Busbee Community Front Desk',
    latitude: 33.9470,
    longitude: -83.3725,
    phone: '(706) 542-7052',
    buildings: ['Busbee Hall'],
  },
  {
    name: 'ECV Community Front Desk',
    latitude: 33.9410,
    longitude: -83.3690,
    phone: '(706) 542-8301',
    buildings: ['Vandiver Hall', 'Rooker Hall', 'McWhorter Hall'],
  },
  {
    name: 'Brown Community Front Desk',
    latitude: 33.9395,
    longitude: -83.3680,
    phone: '(706) 542-4091',
    buildings: ['Brown Hall'],
  },
  {
    name: 'Highland Community Front Desk',
    latitude: 33.9380,
    longitude: -83.3670,
    phone: '(706) 542-5595',
    buildings: ['Highland'],
  },
  {
    name: 'University Village Front Desk',
    latitude: 33.9365,
    longitude: -83.3660,
    phone: '(706) 542-4840',
    buildings: ['1516', 'University Village'],
  },
  {
    name: 'Rogers Road Community Front Desk',
    latitude: 33.9350,
    longitude: -83.3650,
    phone: '(706) 542-5350',
    buildings: ['Rogers Road'],
  },
];

interface EmergencyBannerProps {
  onClose?: () => void;
  onRequestSchedule?: () => void;
}

export function EmergencyBanner({ onClose, onRequestSchedule }: EmergencyBannerProps) {
  const [closestDesk, setClosestDesk] = useState<FrontDesk | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [buildingInput, setBuildingInput] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showEmergencyPopup, setShowEmergencyPopup] = useState(true);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLon = position.coords.longitude;
          let closest = FRONT_DESKS[0];
          let minDistance = calculateDistance(userLat, userLon, closest.latitude, closest.longitude);
          for (let i = 1; i < FRONT_DESKS.length; i++) {
            const dist = calculateDistance(userLat, userLon, FRONT_DESKS[i].latitude, FRONT_DESKS[i].longitude);
            if (dist < minDistance) {
              minDistance = dist;
              closest = FRONT_DESKS[i];
            }
          }
          setClosestDesk(closest);
          setDistance(minDistance);
        },
        () => setClosestDesk(FRONT_DESKS[0])
      );
    }
  }, []);

  const handleBuildingSubmit = () => {
    const name = buildingInput.trim().toLowerCase();
    if (!name) { setFeedback('Please enter a building name'); return; }
    const mappedDeskName = (BUILDING_MAP as Record<string, string>)[name];
    if (mappedDeskName) {
      const mapped = FRONT_DESKS.find((d) => d.name === mappedDeskName);
      if (mapped) { setClosestDesk(mapped); setDistance(0); setFeedback(`Found: ${mapped.name}`); setTimeout(() => setFeedback(null), 5000); return; }
    }
    let match = FRONT_DESKS.find((d) => d.buildings.some((b) => b.toLowerCase() === name));
    if (!match) match = FRONT_DESKS.find((d) => d.buildings.some((b) => b.toLowerCase().includes(name)));
    if (!match) match = FRONT_DESKS.find((d) => d.buildings.some((b) => b.toLowerCase().split(/\s|[-]/).some((part) => part === name)));
    if (match) { setClosestDesk(match); setDistance(0); setFeedback(`Found: ${match.name}`); }
    else { setFeedback('No front desk found. Try the full building name.'); }
    setTimeout(() => setFeedback(null), 5000);
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 3959;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  return (
    <>
      {/* Emergency Popup Modal */}
      {showEmergencyPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            {/* Header */}
            <div className="bg-red-700 text-white p-6 text-center">
              <ShieldAlert className="w-14 h-14 mx-auto mb-3" />
              <h2 className="text-2xl font-bold">Is This an Emergency?</h2>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                <p className="text-gray-900 font-semibold text-center mb-3">
                  If this is a life-threatening emergency:
                </p>
                <a
                  href="tel:911"
                  className="block w-full bg-red-700 text-white text-center py-3 rounded-lg font-bold text-lg hover:bg-red-800 transition-colors"
                >
                  📞 Call 911
                </a>
              </div>

              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                <p className="text-gray-900 font-semibold text-center mb-3">
                  UGA Police (non-emergency):
                </p>
                <a
                  href="tel:7065422200"
                  className="block w-full bg-blue-700 text-white text-center py-3 rounded-lg font-bold text-lg hover:bg-blue-800 transition-colors"
                >
                  📞 (706) 542-2200
                </a>
              </div>

              <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
                <p className="text-gray-900 font-semibold text-center mb-2">
                  Housing issue? Call your front desk:
                </p>
                {closestDesk ? (
                  <div className="text-center">
                    <p className="text-sm text-gray-700 mb-2">📍 {closestDesk.name}</p>
                    <a
                      href={`tel:${closestDesk.phone.replace(/[^0-9]/g, '')}`}
                      className="block w-full bg-amber-600 text-white text-center py-3 rounded-lg font-bold text-lg hover:bg-amber-700 transition-colors"
                    >
                      📞 {closestDesk.phone}
                    </a>
                  </div>
                ) : (
                  <p className="text-sm text-gray-700 text-center">Loading nearest front desk...</p>
                )}
              </div>

              <button
                onClick={() => setShowEmergencyPopup(false)}
                className="w-full py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition-colors"
              >
                I don&apos;t have an emergency — continue to chat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inline Emergency Banner (after popup dismissed) */}
      <div className="bg-red-700 text-white p-4 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              <AlertTriangle className="w-6 h-6 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">Need Help?</h3>
                <p className="text-red-100 text-sm mb-3">
                  Emergency? Call <a href="tel:911" className="underline font-bold">911</a>.
                  Housing issue? Contact your front desk below.
                </p>

                {closestDesk && (
                  <div className="bg-red-800 rounded-lg p-3 mb-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <p className="text-sm font-medium mb-1 flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> Nearest Front Desk
                        </p>
                        <p className="text-base font-bold">{closestDesk.name}</p>
                        {distance !== null && distance > 0 && (
                          <p className="text-xs text-red-200 mt-1">{distance.toFixed(2)} mi away</p>
                        )}
                      </div>
                      <a
                        href={`tel:${closestDesk.phone.replace(/[^0-9]/g, '')}`}
                        className="bg-white text-red-700 px-4 py-2 rounded-lg font-bold hover:bg-red-50 transition-colors whitespace-nowrap flex items-center gap-1"
                      >
                        <Phone className="w-4 h-4" /> {closestDesk.phone}
                      </a>
                    </div>

                    {showDetails && (
                      <div className="mt-3 border-t border-red-600 pt-3">
                        <p className="text-sm font-medium mb-1">Serves:</p>
                        <p className="text-xs text-red-200">{closestDesk.buildings.join(', ')}</p>
                      </div>
                    )}

                    <div className="mt-2 flex items-center gap-3 flex-wrap">
                      <button onClick={() => setShowDetails(!showDetails)} className="text-xs text-red-200 hover:text-white underline">
                        {showDetails ? 'Hide' : 'Show'} buildings
                      </button>
                      <button onClick={() => onRequestSchedule?.()} className="text-xs bg-white text-red-700 px-3 py-1 rounded hover:bg-red-50">
                        Schedule RA visit
                      </button>
                    </div>
                  </div>
                )}

                {/* Building override */}
                <div className="mt-3 flex items-center gap-2">
                  <input
                    value={buildingInput}
                    onChange={(e) => setBuildingInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleBuildingSubmit()}
                    placeholder="Enter your dorm name..."
                    className="flex-1 px-3 py-2 rounded bg-red-800 text-white placeholder-red-300 focus:outline-none text-sm"
                  />
                  <button onClick={handleBuildingSubmit} className="bg-white text-red-700 px-3 py-2 rounded text-sm font-medium">Find</button>
                </div>
                {feedback && <p className="text-xs text-red-200 mt-1">{feedback}</p>}
              </div>
            </div>

            {onClose && (
              <button onClick={onClose} className="flex-shrink-0 text-red-200 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
