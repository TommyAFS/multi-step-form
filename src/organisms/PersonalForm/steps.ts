import content from "./personalFormContent.json";

export type FieldDef = {
  id: string;
  label: string;
  type: "text" | "email" | "tel" | "dob" | "select";
  options?: { value: string; label: string }[];
  autoComplete?: string;
  half?: boolean;
};

export type StepDef = {
  id: string;
  label: string;
  fields: FieldDef[];
  summarise: (values: Record<string, string>) => string;
};

function makeSummarise(fields: FieldDef[]) {
  return (values: Record<string, string>) =>
    fields
      .map((f) => {
        if (f.type === "select" && f.options) {
          return f.options.find((o) => o.value === values[f.id])?.label ?? values[f.id];
        }
        return values[f.id] ?? "";
      })
      .filter(Boolean)
      .join(" · ");
}

export const steps: StepDef[] = content.steps.map((step) => ({
  ...step,
  fields: step.fields as FieldDef[],
  summarise: makeSummarise(step.fields as FieldDef[]),
}));

export function isStepFilled(step: StepDef, values: Record<string, string>): boolean {
  return step.fields.every((f) => (values[f.id] ?? "").trim() !== "");
}
