import { useState } from "react";
import classNames from "classnames";
import Input from "@/atoms/Input";
import Select from "@/atoms/Select";
import { steps, isStepFilled } from "./steps";
import type { StepDef } from "./steps";
import { type SubmitState, submitFormData } from "@/lib/formHelpers";
import styles from "./PersonalForm.module.css";

function ActiveStep({ step, values, onChange, onContinue }: {
  step: StepDef;
  values: Record<string, string>;
  onChange: (id: string, value: string) => void;
  onContinue: () => void;
}) {
  return (
    <div className={styles.fields}>
      {step.fields.map((field) => (
        field.type === "select" ? (
          <Select
            key={field.id}
            id={field.id}
            label={field.label}
            value={values[field.id] ?? ""}
            options={field.options ?? []}
            onChange={(v) => onChange(field.id, v)}
          />
        ) : (
          <Input
            key={field.id}
            id={field.id}
            label={field.label}
            type={field.type}
            value={values[field.id] ?? ""}
            onChange={(v) => onChange(field.id, v)}
            autoComplete={field.autoComplete}
            className={field.half ? styles.half : undefined}
          />
        )
      ))}
      <button
        type="button"
        className={styles.continueButton}
        onClick={onContinue}
        disabled={!isStepFilled(step, values)}
      >
        Continue
      </button>
    </div>
  );
}

export default function PersonalForm() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [submitState, setSubmitState] = useState<SubmitState>({ status: "idle" });

  const activeStepIndex = steps.findIndex((s) => !completedIds.includes(s.id));
  const isComplete = activeStepIndex === -1;

  function handleChange(id: string, value: string) {
    setValues((prev) => ({ ...prev, [id]: value }));
  }

  function handleContinue(stepId: string) {
    setCompletedIds((prev) => [...prev, stepId]);
  }

  function handleEdit(fromIndex: number) {
    setCompletedIds((prev) => prev.slice(0, fromIndex));
    setSubmitState({ status: "idle" });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitState({ status: "loading" });
    try {
      const data = await submitFormData(values);
      console.log("[submit] response:", data);
      setSubmitState({ status: "success", data });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
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
                onChange={handleChange}
                onContinue={() => handleContinue(step.id)}
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
