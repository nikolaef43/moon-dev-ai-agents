import React from 'react';
import { Globe } from 'lucide-react';

const EconomicTwin: React.FC = () => {
    // This component is a conceptual visualization.
    // It uses CSS 3D transforms to create an interactive globe.

    const dataPoints = [
        { name: 'North America', lat: 38, lon: -97, color: 'cyan', value: 95 },
        { name: 'Europe', lat: 54, lon: 15, color: 'green', value: 88 },
        { name: 'East Asia', lat: 34, lon: 104, color: 'purple', value: 92 },
        { name: 'South America', lat: -15, lon: -56, color: 'yellow', value: 75 },
    ];

    const DataPoint: React.FC<{ point: typeof dataPoints[0] }> = ({ point }) => {
        const x = 150 + 150 * Math.cos(point.lon * Math.PI / 180) * Math.cos(point.lat * Math.PI / 180);
        const y = 150 - 150 * Math.sin(point.lat * Math.PI / 180);
        const z = 150 * Math.sin(point.lon * Math.PI / 180) * Math.cos(point.lat * Math.PI / 180);

        const transform = `
            rotateY(${point.lon}deg)
            rotateZ(${-point.lat}deg)
            translateX(150px)
        `;

        const colorMap: Record<string, string> = {
            cyan: 'bg-cyan-400',
            green: 'bg-green-400',
            purple: 'bg-purple-400',
            yellow: 'bg-yellow-400',
        };

        return (
            <div
                className="absolute w-4 h-4 rounded-full group"
                style={{ transform: transform, transformStyle: 'preserve-3d' }}
            >
                <div className={`w-full h-full rounded-full ${colorMap[point.color]} animate-pulse`}></div>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 p-2 bg-slate-950 border border-slate-700 rounded-lg text-xs shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                    <div className="font-bold">{point.name}</div>
                    <div>Stability: {point.value}%</div>
                </div>
            </div>
        );
    };


    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold flex items-center gap-3">
                <Globe size={28} className="text-cyan-400" /> Global Economic Twin (GET)
            </h2>
            <p className="text-slate-400 text-sm max-w-3xl">
                This is not a map; it is a live, petabyte-scale digital twin of the global economy. The AI models supply chains, geopolitical tensions, energy flows, and consumer psychology as a single, interconnected quantum system. A trade is not a bet on a ticker; it is an action designed to position the fund optimally within the most probable future state of this simulation.
            </p>

            <div 
                className="w-full h-[500px] flex items-center justify-center bg-slate-900/50 rounded-lg border border-slate-800"
                style={{ perspective: '1200px' }}
            >
                <div 
                    className="relative w-[300px] h-[300px] animate-spin-3d"
                    style={{ transformStyle: 'preserve-3d' }}
                >
                    {/* Globe surface */}
                     <div 
                        className="absolute inset-0 rounded-full border border-cyan-500/10"
                        style={{
                            backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(0, 100, 150, 0.2), transparent 40%), radial-gradient(circle at 75% 65%, rgba(0, 150, 100, 0.2), transparent 30%)',
                        }}
                     ></div>
                    
                    {/* Rings */}
                    <div className="absolute inset-0 rounded-full border border-slate-700" style={{transform: 'rotateY(30deg)'}} />
                    <div className="absolute inset-0 rounded-full border border-slate-700" style={{transform: 'rotateY(60deg)'}} />
                    <div className="absolute inset-0 rounded-full border border-slate-700" style={{transform: 'rotateY(90deg)'}} />
                    <div className="absolute inset-0 rounded-full border border-slate-700" style={{transform: 'rotateY(120deg)'}} />
                    <div className="absolute inset-0 rounded-full border border-slate-700" style={{transform: 'rotateY(150deg)'}} />

                    {/* Data Points */}
                    {dataPoints.map(p => <DataPoint key={p.name} point={p} />)}
                </div>
            </div>
        </div>
    );
};

export default EconomicTwin;