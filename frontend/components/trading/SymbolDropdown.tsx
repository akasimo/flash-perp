// Inline symbol dropdown for chart header

'use client';

import React, { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';

interface Market {
  symbol: string;
  displayName: string;
}

interface SymbolDropdownProps {
  selected: string;
  onChange: (symbol: string) => void;
}

const MARKETS: Market[] = [
  { symbol: 'BTCUSD', displayName: 'Bitcoin' },
  { symbol: 'ETHUSD', displayName: 'Ethereum' },
  { symbol: 'XLMUSD', displayName: 'Stellar Lumens' },
];

export default function SymbolDropdown({ selected, onChange }: SymbolDropdownProps) {
  const selectedMarket = MARKETS.find(m => m.symbol === selected) || MARKETS[0];

  return (
    <Listbox value={selected} onChange={onChange}>
      <div className="relative">
        <Listbox.Button className="flex items-center space-x-1 hover:bg-gray-800 rounded px-2 py-1 transition-colors">
          <span className="text-white font-semibold text-base">{selected}</span>
          <ChevronDownIcon className="h-4 w-4 text-gray-400" />
        </Listbox.Button>
        
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className="absolute z-50 mt-1 w-48 bg-gray-900 border border-gray-700 rounded-md shadow-lg">
            {MARKETS.map((market) => (
              <Listbox.Option
                key={market.symbol}
                className={({ active }) =>
                  `${active ? 'bg-gray-800' : ''}
                  cursor-pointer select-none px-4 py-2 text-sm`
                }
                value={market.symbol}
              >
                {({ selected }) => (
                  <div className="flex flex-col">
                    <span className={`font-medium ${selected ? 'text-blue-400' : 'text-white'}`}>
                      {market.symbol}
                    </span>
                    <span className="text-xs text-gray-400">{market.displayName}</span>
                  </div>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
}