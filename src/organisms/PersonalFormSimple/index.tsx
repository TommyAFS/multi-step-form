import { useState } from "react";
import classNames from "classnames";
import Input from "@/atoms/Input";
import Select from "@/atoms/Select";
import { steps } from "@/organisms/PersonalForm/steps";
import type { StepDef } from "@/organisms/PersonalForm/steps";
import { type SubmitState, postStepData, submitFormData } from "@/lib/formHelpers";
import styles from "./PersonalFormSimple.module.css";

// Validation rules as a plain object — no hook, no abstraction.
// Each entry maps a field ID to its required message and/or a regex pattern.
type FieldRule = {
  required?: string;
  pattern?: { value: RegExp; message: string };
};

const validationRules: Record<string, FieldRule> = {
  firstName: { required: "First name is required" },
  lastName:  { required: "Last name is required" },
  email:     { required: "Email is required", pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email address" } },
  phone: { required: "Phone number is required", pattern: { value: /^[0-9]+$/ , message: "Phone numbers are need numbers numskull"}},
  dob:       { required: "Date of birth is required" },
  gender:    { required: "Please select a gender" },
  country:   { required: "Please select a country" },
  ecName:    { required: "Full name is required" },
  ecRelationship: { required: "Relationship is required" },
  ecPhone: { required: "Phone number is required", pattern: { value: /^[0-9]+$/, message: "Phone are numbers numbers numbers numskull" } },
};

function validate(id: string, value: string): string {
  const rule = validationRules[id];
  if (!rule) return "";
  if (rule.required && !value.trim()) return rule.required;
  if (rule.pattern && !rule.pattern.value.test(value.trim())) return rule.pattern.message;
  return "";
}

function ActiveStep({ step, values, errors, onChange, onContinue, stepLoading }: {
  step: StepDef;
  values: Record<string, string>;
  errors: Record<string, string>;
  onChange: (id: string, value: string) => void;
  onContinue: () => void;
  stepLoading: boolean;
}) {
  return (
    <div className={styles.fields}>
      {step.fields.map((field) =>
        field.type === "select" ? (
          <Select
            key={field.id}
            id={field.id}
            label={field.label}
            value={values[field.id] ?? ""}
            options={field.options ?? []}
            onChange={(v) => onChange(field.id, v)}
            error={errors[field.id] || undefined}
          />
        ) : (
          <Input
            key={field.id}
            id={field.id}
            label={field.label}
            type={field.type}
            value={values[field.id] ?? ""}
            onChange={(v) => onChange(field.id, v)}
            error={errors[field.id] || undefined}
            autoComplete={field.autoComplete}
            className={field.half ? styles.half : undefined}
          />
        )
      )}
      <button
        type="button"
        className={styles.continueButton}
        onClick={onContinue}
        disabled={stepLoading}
      >
        {stepLoading ? "Saving…" : "Continue"}
      </button>
    </div>
  );
}

export default function PersonalFormSimple() {
  const [values, setValues] = useState<Record<string, string>>({});
  // errors holds the message to display — only set after a field has been blurred
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [stepLoading, setStepLoading] = useState(false);
  const [submitState, setSubmitState] = useState<SubmitState>({ status: "idle" });

  const activeStepIndex = steps.findIndex((s) => !completedIds.includes(s.id));
  const isComplete = activeStepIndex === -1;

  function handleChange(id: string, value: string) {
    setValues((prev) => ({ ...prev, [id]: value }));
    // Re-validate live only if this field already has a displayed error
    if (errors[id] !== undefined) {
      setErrors((prev) => ({ ...prev, [id]: validate(id, value) }));
    }
  }

  async function handleContinue(step: (typeof steps)[number]) {
    const stepErrors: Record<string, string> = {};
    let hasError = false;
    for (const field of step.fields) {
      const msg = validate(field.id, values[field.id] ?? "");
      stepErrors[field.id] = msg;
      if (msg) hasError = true;
    }
    setErrors((prev) => ({ ...prev, ...stepErrors }));
    if (!hasError) {
      const stepFields = Object.fromEntries(step.fields.map((f) => [f.id, values[f.id] ?? ""]));
      console.log(`[${step.id}] continue — posting:`, { step: step.id, value: stepFields });
      setStepLoading(true);
      try {
        const data = await postStepData(step.id, stepFields);
        console.log(`[${step.id}] post success:`, data);
      } catch (err) {
        console.error(`[${step.id}] post error:`, err instanceof Error ? err.message : err);
      } finally {
        setStepLoading(false);
        setCompletedIds((prev) => [...prev, step.id]);
      }
    }
  }

  function handleEdit(fromIndex: number) {
    setCompletedIds((prev) => prev.slice(0, fromIndex));
    setSubmitState({ status: "idle" });
  }

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitState({ status: "loading" });
    try {
      const data = await submitFormData(values);
      console.log("[submit] response:", data);
      setSubmitState({ status: "success", data });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error("[submit] error:", message);
      setSubmitState({ status: "error", message });
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {steps.map((step, index) => {
        const isCompleted = completedIds.includes(step.id);
        const isActive = index === activeStepIndex;

        return (
          <fieldset
            key={step.id}
            disabled={!isCompleted && !isActive}
            className={classNames(styles.fieldset, { [styles.active]: isActive })}
          >
            <legend className={styles.legend}>{step.label}</legend>
            {isCompleted && (
              <div className={styles.completedRow}>
                <p className={styles.completedValue}>{step.summarise(values)}</p>
                <button type="button" className={styles.editButton} onClick={() => handleEdit(index)}>Edit</button>
              </div>
            )}
            {isActive && (
              <ActiveStep
                step={step}
                values={values}
                errors={errors}
                onChange={handleChange}
                onContinue={() => handleContinue(step)}
                stepLoading={stepLoading}
              />
            )}
          </fieldset>
        );
      })}

      {isComplete && (
        <div className={styles.submitSection}>
          <button type="submit" className={styles.submitButton} disabled={submitState.status === "loading"}>
            {submitState.status === "loading" ? "Submitting…" : "Submit"}
          </button>
          {submitState.status === "success" && (
            <pre className={styles.response}>{JSON.stringify(submitState.data, null, 2)}</pre>
          )}
          {submitState.status === "error" && (
            <p className={styles.error}>{submitState.message}</p>
          )}
        </div>
      )}
    </form>
  );
}
