import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function HorizonCalculator() {
  const [height, setHeight] = useState<string>('6');
  const [unit, setUnit] = useState<'feet' | 'meters'>('feet');

  const calculateHorizon = () => {
    const h = parseFloat(height) || 0;
    const heightMeters = unit === 'feet' ? h * 0.3048 : h;
    const earthRadius = 6371000; // meters
    const distanceMeters = Math.sqrt(2 * earthRadius * heightMeters);
    const distanceMiles = distanceMeters / 1609.34;
    const distanceKm = distanceMeters / 1000;
    return { miles: distanceMiles, km: distanceKm };
  };

  const result = calculateHorizon();

  return (
    <Card className="p-6">
      <h3 className="text-xl font-bold mb-4">Horizon Distance Calculator</h3>
      <img src="https://d64gsuwffb70l.cloudfront.net/6921b905a44250e318108d2c_1763913417787_6be9d08e.webp" alt="Horizon diagram" className="w-full h-48 object-cover rounded-lg mb-4" />
      
      <div className="space-y-4">
        <div>
          <Label>Observer Height</Label>
          <div className="flex gap-2">
            <Input type="number" value={height} onChange={(e) => setHeight(e.target.value)} />
            <select value={unit} onChange={(e) => setUnit(e.target.value as 'feet' | 'meters')} className="px-3 border rounded">
              <option value="feet">Feet</option>
              <option value="meters">Meters</option>
            </select>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Calculated Horizon Distance:</h4>
          <p className="text-2xl font-bold text-blue-600">{result.miles.toFixed(2)} miles</p>
          <p className="text-lg text-gray-600">{result.km.toFixed(2)} kilometers</p>
        </div>
      </div>
    </Card>
  );
}
