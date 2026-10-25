import React, { useState } from 'react';
import { ArrowLeft, Lock } from 'lucide-react';

interface DecoyViewProps {
  onExitDecoy: () => void;
}

export const DecoyView: React.FC<DecoyViewProps> = ({ onExitDecoy }) => {
  const [calcDisplay, setCalcDisplay] = useState('0');

  const handleDigit = (digit: string) => {
    setCalcDisplay(prev => (prev === '0' ? digit : prev + digit));
  };

  const handleClear = () => {
    setCalcDisplay('0');
  };

  const handleCalculate = () => {
    try {
      // Safe evaluation for basic math
      const sanitized = calcDisplay.replace(/[^0-9+\-*/.]/g, '');
      const res = Function(`'use strict'; return (${sanitized})`)();
      setCalcDisplay(String(res));
    } catch {
      setCalcDisplay('Error');
    }
  };

  return (
    <div className="flex flex-col flex-1 bg-black text-white p-4 justify-between">
      {/* Top Header disguised as Android Calculator */}
      <div className="flex items-center justify-between text-xs text-neutral-400 py-2 border-b border-neutral-800">
        <span className="font-mono">Calculator</span>
        <button
          type="button"
          onClick={onExitDecoy}
          className="text-neutral-500 hover:text-emerald-400 flex items-center gap-1 text-[11px]"
        >
          <Lock className="w-3 h-3" />
          <span>Exit Stealth</span>
        </button>
      </div>

      {/* Screen */}
      <div className="py-8 text-right px-2">
        <span className="text-4xl font-mono tracking-tight">{calcDisplay}</span>
      </div>

      {/* Keypad */}
      <div className="grid grid-cols-4 gap-2 mb-6">
        {['C', '(', ')', '/'].map(btn => (
          <button
            key={btn}
            type="button"
            onClick={() => (btn === 'C' ? handleClear() : handleDigit(btn))}
            className="h-16 rounded-full bg-neutral-800 text-lg font-mono text-neutral-300 active:bg-neutral-700"
          >
            {btn}
          </button>
        ))}
        {['7', '8', '9', '*'].map(btn => (
          <button
            key={btn}
            type="button"
            onClick={() => handleDigit(btn)}
            className="h-16 rounded-full bg-neutral-900 text-xl font-mono text-white active:bg-neutral-800"
          >
            {btn}
          </button>
        ))}
        {['4', '5', '6', '-'].map(btn => (
          <button
            key={btn}
            type="button"
            onClick={() => handleDigit(btn)}
            className="h-16 rounded-full bg-neutral-900 text-xl font-mono text-white active:bg-neutral-800"
          >
            {btn}
          </button>
        ))}
        {['1', '2', '3', '+'].map(btn => (
          <button
            key={btn}
            type="button"
            onClick={() => handleDigit(btn)}
            className="h-16 rounded-full bg-neutral-900 text-xl font-mono text-white active:bg-neutral-800"
          >
            {btn}
          </button>
        ))}
        {['0', '.', '=', '🔒'].map(btn => (
          <button
            key={btn}
            type="button"
            onClick={() => {
              if (btn === '=') handleCalculate();
              else if (btn === '🔒') onExitDecoy();
              else handleDigit(btn);
            }}
            className={`h-16 rounded-full text-xl font-mono flex items-center justify-center ${
              btn === '='
                ? 'bg-amber-600 text-white active:bg-amber-500'
                : btn === '🔒'
                ? 'bg-neutral-800 text-emerald-400'
                : 'bg-neutral-900 text-white'
            }`}
          >
            {btn}
          </button>
        ))}
      </div>
    </div>
  );
};
