'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import { getInitials, getAvatarColor } from '@/lib/calculations';
import type { Person } from '@/lib/types';

interface PeoplePanelProps {
  people: Person[];
  onAdd: (name: string) => void;
  onRemove: (id: string) => void;
  onRename: (id: string, name: string) => void;
}

export default function PeoplePanel({
  people,
  onAdd,
  onRemove,
  onRename,
}: PeoplePanelProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const addInputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAdding) {
      setTimeout(() => addInputRef.current?.focus(), 40);
    }
  }, [isAdding]);

  useEffect(() => {
    if (editingId) {
      setTimeout(() => editInputRef.current?.focus(), 40);
    }
  }, [editingId]);

  const commitAdd = () => {
    const name = newName.trim();
    if (name) onAdd(name);
    setNewName('');
    setIsAdding(false);
  };

  const commitEdit = () => {
    if (editingId) {
      const name = editName.trim();
      if (name) onRename(editingId, name);
    }
    setEditingId(null);
    setEditName('');
  };

  const startEdit = (person: Person) => {
    setEditingId(person.id);
    setEditName(person.name);
  };

  return (
    <div className="bg-[#18172A] rounded-2xl p-6 border border-[#2E2B45]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-[#EEEAF8]">Who's at the table?</h3>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#4F46E5] text-[#4F46E5] text-sm font-medium hover:bg-[#221F35] active:bg-[#2D2A45] transition-colors"
        >
          <Plus size={14} />
          Add Person
        </button>
      </div>

      <div className="flex flex-wrap gap-2 min-h-[44px] content-start">
        <AnimatePresence>
          {people.map((person) => (
            <motion.div
              key={person.id}
              layout
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 350, damping: 22 }}
              className="group flex items-center gap-1.5 pl-1.5 pr-2 py-1 bg-[#221F35] rounded-full border border-[#2E2B45] hover:border-[#4F4670] transition-colors"
            >
              {/* Avatar circle */}
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                style={{ backgroundColor: getAvatarColor(person.colorIndex) }}
              >
                {getInitials(person.name)}
              </div>

              {/* Name or inline edit */}
              {editingId === person.id ? (
                <input
                  ref={editInputRef}
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onBlur={commitEdit}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commitEdit();
                    if (e.key === 'Escape') {
                      setEditingId(null);
                      setEditName('');
                    }
                  }}
                  className="w-20 text-sm font-medium bg-transparent outline-none border-b border-[#4F46E5] text-[#EEEAF8] pb-px"
                />
              ) : (
                <span
                  className="text-sm font-medium text-[#C4C0DC] cursor-pointer hover:text-[#4F46E5] transition-colors leading-none"
                  onClick={() => startEdit(person)}
                  title="Click to rename"
                >
                  {person.name}
                </span>
              )}

              {/* Remove — only visible on hover, disabled if last person */}
              {people.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(person.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 text-[#4A4665] hover:text-red-400 transition-all ml-0.5"
                  title="Remove"
                >
                  <X size={13} />
                </button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Inline new-person input */}
        <AnimatePresence>
          {isAdding && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 350, damping: 22 }}
              className="flex items-center gap-1.5 pl-3 pr-2 py-1 bg-[#221F35] rounded-full border border-[#4F46E5]"
            >
              <input
                ref={addInputRef}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onBlur={commitAdd}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitAdd();
                  if (e.key === 'Escape') {
                    setIsAdding(false);
                    setNewName('');
                  }
                }}
                placeholder="Name…"
                className="w-20 text-sm font-medium bg-transparent outline-none text-[#EEEAF8] placeholder:text-[#4A4665]"
              />
              <button
                onClick={commitAdd}
                className="text-[#4F46E5] hover:text-[#7C75F0] transition-colors"
              >
                <Plus size={13} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
