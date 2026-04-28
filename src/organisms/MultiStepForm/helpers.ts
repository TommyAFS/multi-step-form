import formContentRaw from "./formContent.json";
import type { Step, RadioOption } from "./types";

export const formContent = formContentRaw as { steps: Step[] };

export function formatOption(option: RadioOption): string {
  const parts = [option.label];
  if (option.dateRange) parts.push(option.dateRange);
  if (option.pricePerWeek) parts.push(`£${option.pricePerWeek}/week`);
  return parts.join(" — ");
}

export function allOptions(step: Step): RadioOption[] {
  return step.groups ? step.groups.flatMap((g) => g.options) : (step.options ?? []);
}

export function selectedLabel(step: Step, id: string): string {
  const option = allOptions(step).find((o) => o.id === id);
  return option ? formatOption(option) : id;
}
