'use client';

import { useState, useMemo, useCallback } from 'react';
import { computeResults, generateId } from '@/lib/calculations';
import { AVATAR_COLORS } from '@/lib/constants';
import type { Person, Item } from '@/lib/types';
import BillSetup from '@/components/BillSetup';
import PeoplePanel from '@/components/PeoplePanel';
import ItemsPanel from '@/components/ItemsPanel';
import ResultsSection from '@/components/ResultsSection';

export default function Home() {
  const [billAmount, setBillAmount] = useState('');
  const [tipPercent, setTipPercent] = useState('');
  const [people, setPeople] = useState<Person[]>([
    { id: 'initial-1', name: 'You', colorIndex: 0 },
  ]);
  const [items, setItems] = useState<Item[]>([]);

  const bill = parseFloat(billAmount) || 0;
  const tip = parseFloat(tipPercent) || 0;
  const totalWithTip = bill * (1 + tip / 100);

  const results = useMemo(
    () => computeResults(people, items, bill, tip),
    [people, items, bill, tip]
  );

  const addPerson = useCallback((name: string) => {
    setPeople((prev) => [
      ...prev,
      {
        id: generateId(),
        name,
        colorIndex: prev.length % AVATAR_COLORS.length,
      },
    ]);
  }, []);

  const removePerson = useCallback((id: string) => {
    setPeople((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((p) => p.id !== id);
    });
    setItems((prev) =>
      prev.map((item) => ({
        ...item,
        assignedTo: item.assignedTo.filter((pid) => pid !== id),
      }))
    );
  }, []);

  const renamePerson = useCallback((id: string, name: string) => {
    setPeople((prev) => prev.map((p) => (p.id === id ? { ...p, name } : p)));
  }, []);

  const addItem = useCallback(() => {
    setItems((prev) => [
      ...prev,
      { id: generateId(), name: '', price: 0, assignedTo: [] },
    ]);
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const updateItem = useCallback((id: string, updates: Partial<Item>) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  }, []);

  return (
    <main className="min-h-screen bg-[#0F0E1A] py-10 px-4">
      <div className="max-w-4xl mx-auto">
        {/* ── Header ── */}
        <header className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-[#EEEAF8] tracking-tight">
            Split<span className="text-[#4F46E5]">Tab</span>
          </h1>
          <p className="text-[#6B6687] mt-2 text-base">
            No more awkward restaurant math.
          </p>
        </header>

        {/* Mobile "See Results" anchor — only when there's a bill */}
        {bill > 0 && (
          <div className="md:hidden text-center mb-5">
            <a
              href="#results"
              className="text-sm text-[#4F46E5] font-medium underline underline-offset-2"
            >
              See Results ↓
            </a>
          </div>
        )}

        <div className="space-y-6">
          {/* ── Section 1: Bill Setup ── */}
          <BillSetup
            billAmount={billAmount}
            tipPercent={tipPercent}
            onBillChange={setBillAmount}
            onTipChange={setTipPercent}
          />

          {/* ── Section 2: People & Items ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PeoplePanel
              people={people}
              onAdd={addPerson}
              onRemove={removePerson}
              onRename={renamePerson}
            />
            <ItemsPanel
              items={items}
              people={people}
              onAdd={addItem}
              onRemove={removeItem}
              onUpdate={updateItem}
            />
          </div>

          {/* ── Section 3: Results ── */}
          <ResultsSection
            results={results}
            totalWithTip={totalWithTip}
            billAmount={bill}
            tipPercent={tip}
            people={people}
            hasItems={items.length > 0}
          />
        </div>
      </div>
    </main>
  );
}
