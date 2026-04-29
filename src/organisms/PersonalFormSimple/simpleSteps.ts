import content from "./personalFormSimpleContent.json";

export type FieldDefinition = {
  id: string;
  label: string;
  type: "text" | "email" | "tel" | "dob" | "select" | "radio";
  options?: { value: string; label: string }[];
  autoComplete?: string;
  half?: boolean;
};

export type StepDefinition = {
  id: string;
  label: string;
  fields: FieldDefinition[];
  summarise: (values: Record<string, string>) => string;
};

function makeSummarise(fields: FieldDefinition[]) {
  return (values: Record<string, string>) =>
    fields
      .map((field) => {
        if ((field.type === "select" || field.type === "radio") && field.options) {
          return field.options.find((option) => option.value === values[field.id])?.label ?? values[field.id];
        }
        return values[field.id] ?? "";
      })
      .filter(Boolean)
      .join(" · ");
}

export const steps: StepDefinition[] = content.steps.map((step) => ({
  ...step,
  fields: step.fields as FieldDefinition[],
  summarise: makeSummarise(step.fields as FieldDefinition[]),
}));

export function isStepFilled(
  step: StepDefinition,
  values: Record<string, string>,
  dobValues?: Record<string, { day: string; month: string; year: string }>
): boolean {
  return step.fields.every((field) => {
    if (field.type === "dob") {
      const dobValue = dobValues?.[field.id];
      return !!dobValue?.day && !!dobValue?.month && !!dobValue?.year;
    }
    return (values[field.id] ?? "").trim() !== "";
  });
}
