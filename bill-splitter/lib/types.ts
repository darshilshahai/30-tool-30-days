export interface Person {
  id: string;
  name: string;
  colorIndex: number;
}

export interface Item {
  id: string;
  name: string;
  price: number;
  assignedTo: string[]; // person IDs
}

export interface DenominationBreakdown {
  value: number;
  count: number;
  label: string;
}

export interface AssignedItemShare {
  itemId: string;
  itemName: string;
  share: number;
}

export interface PersonResult {
  person: Person;
  assignedItems: AssignedItemShare[]; // items explicitly assigned to this person
  sharedPortion: number; // unassigned items + bill remainder split equally
  tipShare: number;
  subtotal: number;
  total: number;
  denominations: DenominationBreakdown[];
}
