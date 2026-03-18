'use client';

import { motion } from 'framer-motion';
import { formatCurrency } from '@/lib/calculations';
import { TIP_PRESETS } from '@/lib/constants';

interface BillSetupProps {
  billAmount: string;
  tipPercent: string;
  onBillChange: (val: string) => void;
  onTipChange: (val: string) => void;
}

export default function BillSetup({
  billAmount,
  tipPercent,
  onBillChange,
  onTipChange,
}: BillSetupProps) {
  const bill = parseFloat(billAmount) || 0;
  const tip = parseFloat(tipPercent) || 0;
  const tipAmount = (bill * tip) / 100;
  const totalWithTip = bill + tipAmount;

  return (
    <div className="bg-[#18172A] rounded-2xl p-6 border border-[#2E2B45]">
      <h2 className="text-2xl font-bold text-[#EEEAF8] mb-6">What's the damage?</h2>

      <div className="flex gap-4 mb-4">
        {/* Total Bill */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-[#A09BBF] mb-2">Total Bill</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6687] font-medium select-none pointer-events-none">
              $
            </span>
            <input
              type="number"
              value={billAmount}
              onChange={(e) => onBillChange(e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.01"
              className="w-full pl-7 pr-4 py-3 rounded-xl border border-[#38355A] bg-[#221F35] text-[#EEEAF8] font-medium text-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition-all placeholder:text-[#4A4665]"
            />
          </div>
        </div>

        {/* Tip */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-[#A09BBF] mb-2">Tip</label>
          <div className="relative">
            <input
              type="number"
              value={tipPercent}
              onChange={(e) => onTipChange(e.target.value)}
              placeholder="0"
              min="0"
              max="100"
              step="1"
              className="w-full pl-4 pr-8 py-3 rounded-xl border border-[#38355A] bg-[#221F35] text-[#EEEAF8] font-medium text-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition-all placeholder:text-[#4A4665]"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B6687] font-medium select-none pointer-events-none">
              %
            </span>
          </div>
        </div>
      </div>

      {/* Tip preset pills */}
      <div className="flex gap-2 mb-5">
        {TIP_PRESETS.map((preset) => {
          const isActive = tipPercent === String(preset);
          return (
            <motion.button
              key={preset}
              whileTap={{ scale: 0.88 }}
              transition={{ type: 'spring', stiffness: 500, damping: 18 }}
              onClick={() => onTipChange(isActive ? '' : String(preset))}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-150 ${
                isActive
                  ? 'bg-[#4F46E5] text-white shadow-sm shadow-indigo-900/50'
                  : 'bg-[#221F35] text-[#A09BBF] hover:bg-[#2D2A45] border border-[#38355A]'
              }`}
            >
              {preset}%
            </motion.button>
          );
        })}
      </div>

      {/* Live computed summary */}
      {bill > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="flex flex-wrap gap-x-4 gap-y-2 py-3.5 px-4 bg-[#221F35] rounded-xl text-sm border border-[#2E2B45]"
        >
          <span className="text-[#A09BBF]">
            Subtotal{' '}
            <span className="font-semibold text-[#EEEAF8]">{formatCurrency(bill)}</span>
          </span>
          <span className="text-[#3D3A58] hidden sm:block">·</span>
          <span className="text-[#A09BBF]">
            Tip{' '}
            <span className="font-semibold text-[#EEEAF8]">{formatCurrency(tipAmount)}</span>
          </span>
          <span className="text-[#3D3A58] hidden sm:block">·</span>
          <span className="text-[#A09BBF]">
            Total{' '}
            <span className="font-bold text-[#4F46E5]">{formatCurrency(totalWithTip)}</span>
          </span>
        </motion.div>
      )}
    </div>
  );
}
