'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2 } from 'lucide-react';
import { getInitials, getAvatarColor } from '@/lib/calculations';
import type { Person, Item } from '@/lib/types';

interface ItemsPanelProps {
  items: Item[];
  people: Person[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Item>) => void;
}

export default function ItemsPanel({
  items,
  people,
  onAdd,
  onRemove,
  onUpdate,
}: ItemsPanelProps) {
  const toggleAssignee = (item: Item, personId: string) => {
    const updated = item.assignedTo.includes(personId)
      ? item.assignedTo.filter((id) => id !== personId)
      : [...item.assignedTo, personId];
    onUpdate(item.id, { assignedTo: updated });
  };

  return (
    <div className="bg-[#18172A] rounded-2xl p-6 border border-[#2E2B45]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-bold text-[#EEEAF8]">Add items</h3>
          <span className="text-xs text-[#6B6687] bg-[#221F35] border border-[#2E2B45] px-2 py-0.5 rounded-full font-medium">
            optional
          </span>
        </div>
        <button
          onClick={onAdd}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#4F46E5] text-[#4F46E5] text-sm font-medium hover:bg-[#221F35] active:bg-[#2D2A45] transition-colors"
        >
          <Plus size={14} />
          Add Item
        </button>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-[#6B6687] italic">
          No items — everyone splits the total equally.
        </p>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {items.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -12, transition: { duration: 0.15 } }}
                className="group flex flex-col gap-2 p-3 bg-[#221F35] rounded-xl border border-[#2E2B45]"
              >
                {/* Name + price row */}
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => onUpdate(item.id, { name: e.target.value })}
                    placeholder="Item name"
                    className="flex-1 text-sm font-medium bg-transparent outline-none border-b border-transparent focus:border-[#4F46E5] text-[#EEEAF8] placeholder:text-[#4A4665] transition-colors py-0.5 min-w-0"
                  />

                  {/* Price input */}
                  <div className="flex items-center flex-shrink-0">
                    <span className="text-[#6B6687] text-sm mr-0.5">$</span>
                    <input
                      type="number"
                      value={item.price || ''}
                      onChange={(e) =>
                        onUpdate(item.id, { price: parseFloat(e.target.value) || 0 })
                      }
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="w-16 text-sm font-semibold bg-transparent outline-none border-b border-transparent focus:border-[#4F46E5] text-[#EEEAF8] placeholder:text-[#4A4665] transition-colors py-0.5 text-right"
                    />
                  </div>

                  {/* Trash — hover only */}
                  <button
                    onClick={() => onRemove(item.id)}
                    className="opacity-0 group-hover:opacity-100 text-[#4A4665] hover:text-red-400 transition-all ml-1 flex-shrink-0"
                    title="Remove item"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                {/* Assignee chips */}
                {people.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {people.map((person) => {
                      const isSelected = item.assignedTo.includes(person.id);
                      const color = getAvatarColor(person.colorIndex);
                      return (
                        <button
                          key={person.id}
                          onClick={() => toggleAssignee(item, person.id)}
                          className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-all ${
                            isSelected
                              ? 'text-white'
                              : 'text-[#A09BBF] bg-[#2D2A45] border border-[#38355A] hover:border-[#4F4670]'
                          }`}
                          style={
                            isSelected
                              ? { backgroundColor: color, borderColor: color }
                              : {}
                          }
                          title={person.name}
                        >
                          <span
                            className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold text-white"
                            style={{
                              backgroundColor: isSelected
                                ? 'rgba(255,255,255,0.25)'
                                : color,
                            }}
                          >
                            {getInitials(person.name)[0]}
                          </span>
                          {person.name.split(' ')[0]}
                        </button>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
