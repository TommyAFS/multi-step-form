export type RadioOption = {
  id: string;
  label: string;
  dateRange?: string;
  pricePerWeek?: number;
};

export type Group = { id: string; label: string; count: number; options: RadioOption[] };

export type Step = {
  id: string;
  label: string;
  type: string;
  options?: RadioOption[];
  groups?: Group[];
};

export type Selections = Record<string, string>;
