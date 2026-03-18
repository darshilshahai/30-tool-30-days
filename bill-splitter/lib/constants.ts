export const AVATAR_COLORS = [
  '#4F46E5', // indigo
  '#10B981', // emerald
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // violet
  '#06B6D4', // cyan
  '#F97316', // orange
  '#EC4899', // pink
] as const;

export const TIP_PRESETS = [15, 18, 20] as const;

export const DENOMINATIONS: Array<{ cents: number; value: number; label: string }> = [
  { cents: 10000, value: 100,  label: '$100' },
  { cents: 5000,  value: 50,   label: '$50'  },
  { cents: 2000,  value: 20,   label: '$20'  },
  { cents: 1000,  value: 10,   label: '$10'  },
  { cents: 500,   value: 5,    label: '$5'   },
  { cents: 100,   value: 1,    label: '$1'   },
  { cents: 25,    value: 0.25, label: '25¢'  },
  { cents: 10,    value: 0.10, label: '10¢'  },
  { cents: 5,     value: 0.05, label: '5¢'   },
  { cents: 1,     value: 0.01, label: '1¢'   },
];
