'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, UtensilsCrossed } from 'lucide-react';
import { getInitials, getAvatarColor, formatCurrency } from '@/lib/calculations';
import type { PersonResult } from '@/lib/types';
import type { Person } from '@/lib/types';

interface ResultsSectionProps {
  results: PersonResult[];
  totalWithTip: number;
  billAmount: number;
  tipPercent: number;
  people: Person[];
  hasItems: boolean;
}

export default function ResultsSection({
  results,
  totalWithTip,
  billAmount,
  tipPercent,
  people,
  hasItems,
}: ResultsSectionProps) {
  const [copied, setCopied] = useState(false);

  const sumOfShares = results.reduce((s, r) => s + r.total, 0);
  const isBalanced = Math.abs(sumOfShares - totalWithTip) < 0.02;

  const buildCopyText = (): string => {
    const lines: string[] = [
      '🍽️ SplitTab Summary',
      `Total: ${formatCurrency(totalWithTip)}${tipPercent > 0 ? ` (incl. ${tipPercent}% tip)` : ''}`,
      '',
    ];

    for (const result of results) {
      lines.push(`${result.person.name} → ${formatCurrency(result.total)}`);
      for (const item of result.assignedItems) {
        lines.push(`  • ${item.itemName || 'Item'} ${formatCurrency(item.share)}`);
      }
      if (result.sharedPortion > 0 && hasItems) {
        lines.push(`  • Shared items ${formatCurrency(result.sharedPortion)}`);
      }
      if (tipPercent > 0) {
        lines.push(`  • Share of tip ${formatCurrency(result.tipShare)}`);
      }
      lines.push('');
    }

    return lines.join('\n');
  };

  const handleCopy = async () => {
    const text = buildCopyText();
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const el = document.createElement('textarea');
      el.value = text;
      el.style.position = 'fixed';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Empty state
  if (billAmount <= 0) {
    return (
      <div
        id="results"
        className="bg-[#18172A] rounded-2xl p-10 border border-[#2E2B45] text-center"
      >
        <UtensilsCrossed size={36} className="mx-auto text-[#3D3A58] mb-3" />
        <p className="text-[#6B6687] font-medium">Enter a bill amount to see the split</p>
      </div>
    );
  }

  const copyButtonContent = (
    <AnimatePresence mode="wait">
      {copied ? (
        <motion.span
          key="copied"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          className="flex items-center gap-2"
        >
          <Check size={17} />
          Copied! Send it to the group chat
        </motion.span>
      ) : (
        <motion.span
          key="copy"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          className="flex items-center gap-2"
        >
          <Copy size={17} />
          Copy Summary
        </motion.span>
      )}
    </AnimatePresence>
  );

  return (
    <div id="results" className="space-y-4 pb-20 md:pb-0">
      {/* Section header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-2xl font-bold text-[#EEEAF8]">Here's who owes what</h2>
        {people.length === 1 && (
          <span className="text-sm text-[#6B6687] italic">Just you? Treat yourself. 🎉</span>
        )}
      </div>

      {/* Per-person result cards */}
      <AnimatePresence>
        {results.map((result, index) => {
          const color = getAvatarColor(result.person.colorIndex);
          const hasDetail =
            hasItems && (result.assignedItems.length > 0 || result.sharedPortion > 0);
          const denomText = result.denominations
            .map((d) => `${d.count} × ${d.label}`)
            .join(' · ');

          return (
            <motion.div
              key={result.person.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.22, delay: index * 0.04 }}
              className="bg-[#18172A] rounded-2xl border border-[#2E2B45] overflow-hidden"
              style={{ borderLeft: `4px solid ${color}` }}
            >
              <div className="p-5">
                {/* Avatar + name + total */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    {/* Avatar */}
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: color }}
                    >
                      {getInitials(result.person.name)}
                    </div>

                    {/* Name + item breakdown */}
                    <div className="min-w-0">
                      <div className="font-bold text-[#EEEAF8] text-base leading-snug">
                        {result.person.name}
                      </div>

                      {hasDetail && (
                        <div className="mt-1 space-y-0.5">
                          {result.assignedItems.map((item) => (
                            <div key={item.itemId} className="text-xs text-[#6B6687]">
                              {item.itemName || 'Unnamed item'}{' '}
                              <span className="font-medium text-[#A09BBF]">
                                {formatCurrency(item.share)}
                              </span>
                            </div>
                          ))}
                          {result.sharedPortion > 0 && (
                            <div className="text-xs text-[#6B6687]">
                              Shared items{' '}
                              <span className="font-medium text-[#A09BBF]">
                                {formatCurrency(result.sharedPortion)}
                              </span>
                            </div>
                          )}
                          {tipPercent > 0 && (
                            <div className="text-xs text-[#6B6687]">
                              Tip share{' '}
                              <span className="font-medium text-[#A09BBF]">
                                {formatCurrency(result.tipShare)}
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {!hasDetail && tipPercent > 0 && (
                        <div className="text-xs text-[#6B6687] mt-0.5">
                          incl.{' '}
                          <span className="font-medium text-[#A09BBF]">
                            {formatCurrency(result.tipShare)}
                          </span>{' '}
                          tip
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Big bold total */}
                  <div className="text-right flex-shrink-0">
                    <div className="text-2xl font-bold text-[#EEEAF8]">
                      {formatCurrency(result.total)}
                    </div>
                  </div>
                </div>

                {/* Denomination breakdown */}
                {result.denominations.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-[#2E2B45]">
                    <p className="text-xs text-[#6B6687]">{denomText}</p>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Sanity check */}
      {results.length > 1 && (
        <div
          className={`flex items-center justify-between text-sm px-4 py-3 rounded-xl font-medium ${
            isBalanced
              ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-900/50'
              : 'bg-amber-950/60 text-amber-400 border border-amber-900/50'
          }`}
        >
          <span>
            All shares: <strong>{formatCurrency(sumOfShares)}</strong>
          </span>
          <span>
            {isBalanced ? '✓' : '⚠'} Total:{' '}
            <strong>{formatCurrency(totalWithTip)}</strong>
          </span>
        </div>
      )}

      {/* Copy button — static on desktop */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={handleCopy}
        className={`hidden md:flex w-full py-4 rounded-2xl font-semibold text-base items-center justify-center gap-2 transition-all ${
          copied
            ? 'bg-[#10B981] text-white'
            : 'bg-[#4F46E5] text-white hover:bg-[#4338CA] shadow-lg shadow-indigo-900/40'
        }`}
      >
        {copyButtonContent}
      </motion.button>

      {/* Mobile: fixed bottom copy button */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={handleCopy}
        className={`md:hidden fixed bottom-4 left-4 right-4 z-50 py-4 rounded-2xl font-semibold text-base flex items-center justify-center gap-2 transition-all shadow-lg ${
          copied
            ? 'bg-[#10B981] text-white shadow-emerald-900/40'
            : 'bg-[#4F46E5] text-white shadow-indigo-900/40'
        }`}
      >
        {copyButtonContent}
      </motion.button>
    </div>
  );
}
