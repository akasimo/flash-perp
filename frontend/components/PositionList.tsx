'use client';

import { Position } from '@/types';
import { X } from 'lucide-react';

interface PositionListProps {
  positions: Position[];
  onClosePosition: (position: Position) => void;
}

export default function PositionList({ positions, onClosePosition }: PositionListProps) {
  const formatValue = (value: bigint, decimals: number = 6): string => {
    const divisor = BigInt(10 ** decimals);
    const integerPart = value / divisor;
    const fractionalPart = value % divisor;
    return `${integerPart}.${fractionalPart.toString().padStart(decimals, '0').slice(0, 2)}`;
  };

  const calculatePnL = (position: Position): { value: bigint; percentage: number } => {
    // Simplified P&L calculation
    const currentValue = position.notional; // This should use current mark price
    const entryValue = position.notional;
    const pnl = currentValue - entryValue;
    const percentage = Number(pnl * 100n / entryValue);
    return { value: pnl, percentage };
  };

  return (
    <div className="bg-perp-darker rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Open Positions</h3>
      
      {positions.length === 0 ? (
        <p className="text-gray-400 text-center py-8">No open positions</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-400 border-b border-gray-800">
                <th className="pb-3">Market</th>
                <th className="pb-3">Side</th>
                <th className="pb-3">Size</th>
                <th className="pb-3">Margin</th>
                <th className="pb-3">PnL</th>
                <th className="pb-3"></th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {positions.map((position, index) => {
                const pnl = calculatePnL(position);
                const isLong = position.size > 0n;
                
                return (
                  <tr key={index} className="border-b border-gray-800">
                    <td className="py-3">{position.symbol}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        isLong ? 'bg-perp-success/20 text-perp-success' : 'bg-perp-danger/20 text-perp-danger'
                      }`}>
                        {isLong ? 'LONG' : 'SHORT'}
                      </span>
                    </td>
                    <td className="py-3">{formatValue(position.size)}</td>
                    <td className="py-3">{formatValue(position.margin)} USDC</td>
                    <td className={`py-3 ${pnl.value >= 0 ? 'text-perp-success' : 'text-perp-danger'}`}>
                      {pnl.value >= 0 ? '+' : ''}{formatValue(pnl.value)} ({pnl.percentage.toFixed(2)}%)
                    </td>
                    <td className="py-3">
                      <button
                        onClick={() => onClosePosition(position)}
                        className="text-gray-400 hover:text-white transition"
                      >
                        <X size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}