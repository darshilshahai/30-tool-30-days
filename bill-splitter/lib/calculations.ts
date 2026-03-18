import type { Person, Item, PersonResult, DenominationBreakdown } from './types';
import { DENOMINATIONS, AVATAR_COLORS } from './constants';

export function getDenominations(amount: number): DenominationBreakdown[] {
  let remaining = Math.round(amount * 100); // work in cents to avoid float errors
  const result: DenominationBreakdown[] = [];
  for (const denom of DENOMINATIONS) {
    const count = Math.floor(remaining / denom.cents);
    if (count > 0) {
      result.push({ value: denom.value, count, label: denom.label });
      remaining -= count * denom.cents;
    }
  }
  return result;
}

export function computeResults(
  people: Person[],
  items: Item[],
  billAmount: number,
  tipPercent: number
): PersonResult[] {
  if (people.length === 0 || billAmount <= 0) return [];

  const totalTip = (billAmount * tipPercent) / 100;
  const isItemsMode = items.length > 0;

  // Initialize accumulators per person
  const subtotals: Record<string, number> = {};
  const assignedItemsMap: Record<string, Array<{ itemId: string; itemName: string; share: number }>> = {};
  const sharedPortions: Record<string, number> = {};

  for (const p of people) {
    subtotals[p.id] = 0;
    assignedItemsMap[p.id] = [];
    sharedPortions[p.id] = 0;
  }

  if (!isItemsMode) {
    // Equal split — no items added
    const equalShare = billAmount / people.length;
    for (const p of people) {
      subtotals[p.id] = equalShare;
      sharedPortions[p.id] = equalShare;
    }
  } else {
    // Item-level assignment
    let totalItemsPrice = 0;

    for (const item of items) {
      const price = item.price;
      if (price <= 0) continue;
      totalItemsPrice += price;

      // Filter assignees to only people who still exist
      const validAssignees = item.assignedTo.filter((id) => subtotals.hasOwnProperty(id));
      // If no assignees → split equally among everyone
      const assignees = validAssignees.length > 0 ? validAssignees : people.map((p) => p.id);
      const share = price / assignees.length;

      for (const assigneeId of assignees) {
        subtotals[assigneeId] += share;
        if (validAssignees.length > 0) {
          // Named assignment — goes in itemized list
          assignedItemsMap[assigneeId].push({ itemId: item.id, itemName: item.name, share });
        } else {
          // Unassigned item — goes in shared portion
          sharedPortions[assigneeId] += share;
        }
      }
    }

    // Bill remainder (bill amount not covered by any item) → split equally
    const remainder = Math.max(0, billAmount - totalItemsPrice);
    if (remainder > 0) {
      const remainderPerPerson = remainder / people.length;
      for (const p of people) {
        subtotals[p.id] += remainderPerPerson;
        sharedPortions[p.id] += remainderPerPerson;
      }
    }
  }

  const totalSubtotal = Object.values(subtotals).reduce((a, b) => a + b, 0);

  const results: PersonResult[] = people.map((person) => {
    const subtotal = subtotals[person.id];
    const tipShare =
      totalSubtotal > 0
        ? (subtotal / totalSubtotal) * totalTip
        : totalTip / people.length;
    const total = Math.round((subtotal + tipShare) * 100) / 100;

    return {
      person,
      assignedItems: assignedItemsMap[person.id],
      sharedPortion: Math.round(sharedPortions[person.id] * 100) / 100,
      tipShare: Math.round(tipShare * 100) / 100,
      subtotal: Math.round(subtotal * 100) / 100,
      total,
      denominations: getDenominations(total),
    };
  });

  // Rounding correction → add/subtract remainder to last person
  const sumTotal = results.reduce((s, r) => s + r.total, 0);
  const totalWithTip = Math.round((billAmount + totalTip) * 100) / 100;
  const diff = Math.round((totalWithTip - sumTotal) * 100) / 100;
  if (Math.abs(diff) >= 0.01 && results.length > 0) {
    const last = results[results.length - 1];
    last.total = Math.round((last.total + diff) * 100) / 100;
    last.denominations = getDenominations(last.total);
  }

  return results;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 9);
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  return parts
    .map((p) => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function getAvatarColor(colorIndex: number): string {
  return AVATAR_COLORS[colorIndex % AVATAR_COLORS.length];
}
