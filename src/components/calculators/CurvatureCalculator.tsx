import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function CurvatureCalculator() {
  const [distance, setDistance] = useState<string>('10');
  const [unit, setUnit] = useState<'miles' | 'km'>('miles');

  const calculateDrop = () => {
    const d = parseFloat(distance) || 0;
    const distanceMiles = unit === 'km' ? d * 0.621371 : d;
    const dropFeet = 8 * Math.pow(distanceMiles, 2) / 12;
    const dropMeters = dropFeet * 0.3048;
    const dropInches = dropFeet * 12;
    return { feet: dropFeet, meters: dropMeters, inches: dropInches };
  };

  const result = calculateDrop();

  return (
    <Card className="p-6">
      <h3 className="text-xl font-bold mb-4">Curvature Drop Calculator</h3>
      <img src="https://d64gsuwffb70l.cloudfront.net/6921b905a44250e318108d2c_1763913418929_19d55c76.webp" alt="Curvature diagram" className="w-full h-48 object-cover rounded-lg mb-4" />
      
      <div className="space-y-4">
        <div>
          <Label>Distance</Label>
          <div className="flex gap-2">
            <Input type="number" value={distance} onChange={(e) => setDistance(e.target.value)} />
            <select value={unit} onChange={(e) => setUnit(e.target.value as 'miles' | 'km')} className="px-3 border rounded">
              <option value="miles">Miles</option>
              <option value="km">Kilometers</option>
            </select>
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Expected Curvature Drop:</h4>
          <p className="text-2xl font-bold text-green-600">{result.feet.toFixed(2)} feet</p>
          <p className="text-lg text-gray-600">{result.meters.toFixed(2)} meters ({result.inches.toFixed(0)} inches)</p>
        </div>
      </div>
    </Card>
  );
}
