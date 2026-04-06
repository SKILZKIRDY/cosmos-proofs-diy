import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function PerspectiveCalculator() {
  const [observerHeight, setObserverHeight] = useState<string>('6');
  const [objectHeight, setObjectHeight] = useState<string>('100');
  const [distance, setDistance] = useState<string>('5');

  const calculateAngle = () => {
    const oh = parseFloat(observerHeight) || 0;
    const objH = parseFloat(objectHeight) || 0;
    const dist = parseFloat(distance) || 1;
    const distanceFeet = dist * 5280;
    const heightDiff = objH - oh;
    const angleRad = Math.atan(heightDiff / distanceFeet);
    const angleDeg = angleRad * (180 / Math.PI);
    const apparentSize = (objH / distanceFeet) * 100;
    return { degrees: angleDeg, apparent: apparentSize };
  };

  const result = calculateAngle();

  return (
    <Card className="p-6">
      <h3 className="text-xl font-bold mb-4">Perspective Angle Calculator</h3>
      <img src="https://d64gsuwffb70l.cloudfront.net/6921b905a44250e318108d2c_1763913419798_9609c00f.webp" alt="Perspective diagram" className="w-full h-48 object-cover rounded-lg mb-4" />
      
      <div className="space-y-4">
        <div>
          <Label>Observer Height (feet)</Label>
          <Input type="number" value={observerHeight} onChange={(e) => setObserverHeight(e.target.value)} />
        </div>
        <div>
          <Label>Object Height (feet)</Label>
          <Input type="number" value={objectHeight} onChange={(e) => setObjectHeight(e.target.value)} />
        </div>
        <div>
          <Label>Distance (miles)</Label>
          <Input type="number" value={distance} onChange={(e) => setDistance(e.target.value)} />
        </div>

        <div className="bg-orange-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Viewing Angle:</h4>
          <p className="text-2xl font-bold text-orange-600">{result.degrees.toFixed(3)}°</p>
          <p className="text-sm text-gray-600 mt-2">Apparent size: {result.apparent.toFixed(4)}%</p>
        </div>
      </div>
    </Card>
  );
}
