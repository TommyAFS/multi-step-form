import { useState } from "react";
import classNames from "classnames";
import Input from "@/atoms/Input";
import Select from "@/atoms/Select";
import { steps } from "@/organisms/PersonalForm/steps";
import type { StepDef } from "@/organisms/PersonalForm/steps";
import { useForm } from "@/hooks/useForm";
import { type SubmitState, submitFormData } from "@/lib/formHelpers";
import styles from "./PersonalFormHook.module.css";

// All field IDs across every step, typed so the hook can infer validation shape
type FormValues = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dob: string;
  gender: string;
  country: string;
  ecName: string;
  ecRelationship: string;
  ecPhone: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_NUMBER_PATTERN = /^[0-9]+$/

function ActiveStep({ step, fields, errors, updateField, onContinue }: {
  step: StepDef;
  fields: FormValues;
  errors: Partial<Record<keyof FormValues, string>>;
  updateField: (field: keyof FormValues, value: string) => void;
  onContinue: () => void;
}) {
  // Continue requires every field in this step to be filled and error-free
  const canContinue = step.fields.every((f) => {
    const key = f.id as keyof FormValues;
    return (fields[key] ?? "").trim() !== "" && !errors[key];
  });

  return (
    <div className={styles.fields}>
      {step.fields.map((field) => {
        const key = field.id as keyof FormValues;
        return field.type === "select" ? (
          <Select
            key={field.id}
            id={field.id}
            label={field.label}
            value={fields[key] ?? ""}
            options={field.options ?? []}
            onChange={(v) => updateField(key, v)}
            error={errors[key] || undefined}
          />
        ) : (
          <Input
            key={field.id}
            id={field.id}
            label={field.label}
            type={field.type}
            value={fields[key] ?? ""}
            onChange={(v) => updateField(key, v)}
            error={errors[key] || undefined}
            autoComplete={field.autoComplete}
            className={field.half ? styles.half : undefined}
          />
        );
      })}
      <button
        type="button"
        className={styles.continueButton}
        onClick={onContinue}
        disabled={!canContinue}
      >
        Continue
      </button>
    </div>
  );
}

export default function PersonalFormHook() {
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [submitState, setSubmitState] = useState<SubmitState>({ status: "idle" });

  // useForm manages field values, errors, and touched state.
  // updateField validates on every change, so errors appear as the user types.
  const form = useForm<FormValues>({
    initialValues: {
      firstName: "", lastName: "", email: "", phone: "",
      dob: "", gender: "", country: "",
      ecName: "", ecRelationship: "", ecPhone: "",
    },
    validations: {
      firstName: { required: { value: true, message: "First name is required" } },
      lastName:  { required: { value: true, message: "Last name is required" } },
      email:     { required: { value: true, message: "Email is required" }, pattern: { value: EMAIL_PATTERN, message: "Enter a valid email address" } },
      phone:     { required: { value: true, message: "Phone number is required"}, pattern: { value: PHONE_NUMBER_PATTERN, message: "Enter a valid phone number"} },
      dob:       { required: { value: true, message: "Date of birth is required" } },
      gender:    { required: { value: true, message: "Please select a gender" } },
      country:   { required: { value: true, message: "Please select a country" } },
      ecName:    { required: { value: true, message: "Full name is required" } },
      ecRelationship: { required: { value: true, message: "Relationship is required" } },
      ecPhone: { required: { value: true, message: "Phone number is required" }, pattern: { value: PHONE_NUMBER_PATTERN, message: "Enter a valid phone number" } },
    },
  });

  const activeStepIndex = steps.findIndex((s) => !completedIds.includes(s.id));
  const isComplete = activeStepIndex === -1;

  function handleContinue(stepId: string) {
    setCompletedIds((prev) => [...prev, stepId]);
  }

  function handleEdit(fromIndex: number) {
    setCompletedIds((prev) => prev.slice(0, fromIndex));
    setSubmitState({ status: "idle" });
  }

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitState({ status: "loading" });
    try {
      const data = await submitFormData(form.fields);
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
                <p className={styles.completedValue}>{step.summarise(form.fields as Record<string, string>)}</p>
                <button type="button" className={styles.editButton} onClick={() => handleEdit(index)}>Edit</button>
              </div>
            )}
            {isActive && (
              <ActiveStep
                step={step}
                fields={form.fields}
                errors={form.errors}
                updateField={form.updateField}
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
