import { useState } from "react";
import classNames from "classnames";
import Input from "@/atoms/Input/Input";
import Select from "@/atoms/Select/Select";
import FieldDateOfBirth from "@/atoms/Date/date";
import { validateDateOfBirth } from "@/atoms/Date/date.validation";
import { steps } from "@/organisms/PersonalForm/steps";
import type { StepDef } from "@/organisms/PersonalForm/steps";
import { useForm } from "@/hooks/useForm";
import { type SubmitState, postStepData, submitFormData } from "@/lib/formHelpers";
import styles from "./PersonalFormHook.module.css";

type DobValue = { day: string; month: string; year: string };

type FormValues = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dob: DobValue;
  gender: string;
  country: string;
  ecName: string;
  ecRelationship: string;
  ecPhone: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_NUMBER_PATTERN = /^\d+$/;

type ActiveStepProps = {
  step: StepDef;
  fields: FormValues;
  errors: Partial<Record<keyof FormValues, string>>;
  updateField: (field: keyof FormValues, value: FormValues[keyof FormValues]) => void;
  onContinue: () => void;
  stepLoading: boolean;
};

function renderField(field: StepDef["fields"][number], props: ActiveStepProps) {
  const { fields, errors, updateField } = props;

  if (field.type === "dob") {
    return (
      <FieldDateOfBirth
        key={field.id}
        id={field.id}
        value={fields.dob}
        onChange={(v: DobValue) => updateField("dob", v)}
        error={errors.dob || undefined}
      />
    );
  }

  const key = field.id as keyof Omit<FormValues, "dob">;

  if (field.type === "select") {
    return (
      <Select
        key={field.id}
        id={field.id}
        label={field.label}
        value={fields[key] ?? ""}
        options={field.options ?? []}
        onChange={(v: string) => updateField(key, v)}
        error={errors[key] || undefined}
      />
    );
  }

  return (
    <Input
      key={field.id}
      id={field.id}
      label={field.label}
      type={field.type}
      value={(fields[key] as string) ?? ""}
      onChange={(v: string) => updateField(key, v)}
      error={errors[key] || undefined}
      autoComplete={field.autoComplete}
      className={field.half ? styles.half : undefined}
    />
  );
}

function ActiveStep(props: ActiveStepProps) {
  const { step, fields, errors, onContinue, stepLoading } = props;

  const canContinue = step.fields.every((f) => {
    if (f.type === "dob") {
      return !!fields.dob.day && !!fields.dob.month && !!fields.dob.year && !errors.dob;
    }
    const key = f.id as keyof FormValues;
    return (fields[key] as string ?? "").trim() !== "" && !errors[key];
  });

  return (
    <div className={styles.fields}>
      {step.fields.map((field) => renderField(field, props))}
      <button
        type="button"
        className={styles.continueButton}
        onClick={onContinue}
        disabled={!canContinue || stepLoading}
      >
        {stepLoading ? "Saving…" : "Continue"}
      </button>
    </div>
  );
}

export default function PersonalFormHook() {
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [stepLoading, setStepLoading] = useState(false);
  const [submitState, setSubmitState] = useState<SubmitState>({ status: "idle" });

  const form = useForm<FormValues>({
    initialValues: {
      firstName: "", lastName: "", email: "", phone: "",
      dob: { day: "", month: "", year: "" },
      gender: "", country: "",
      ecName: "", ecRelationship: "", ecPhone: "",
    },
    validations: {
      firstName: { required: { value: true, message: "First name is required" } },
      lastName:  { required: { value: true, message: "Last name is required" } },
      email:     { required: { value: true, message: "Email is required" }, pattern: { value: EMAIL_PATTERN, message: "Enter a valid email address" } },
      phone:     { required: { value: true, message: "Phone number is required"}, pattern: { value: PHONE_NUMBER_PATTERN, message: "Enter a valid phone number"} },
      dob:       { custom: (value: any) => {
        const result = validateDateOfBirth(value, { minYearOfBirth: 1900, maxYearOfBirth: 2010, contactType: "student" });
        const message = result.errors.day || result.errors.month || result.errors.year || "Date of birth is required";
        return { isValid: result.isValid, message };
      }},
      gender:    { required: { value: true, message: "Please select a gender" } },
      country:   { required: { value: true, message: "Please select a country" } },
      ecName:    { required: { value: true, message: "Full name is required" } },
      ecRelationship: { required: { value: true, message: "Relationship is required" } },
      ecPhone: { required: { value: true, message: "Phone number is required" }, pattern: { value: PHONE_NUMBER_PATTERN, message: "Enter a valid phone number" } },
    },
  });

  const activeStepIndex = steps.findIndex((s) => !completedIds.includes(s.id));
  const isComplete = activeStepIndex === -1;

  async function handleContinue(stepId: string) {
    const step = steps.find((s) => s.id === stepId)!;
    const stepFields = Object.fromEntries(
      step.fields.map((f) =>
        f.type === "dob"
          ? [f.id, `${form.fields.dob.day}/${form.fields.dob.month}/${form.fields.dob.year}`]
          : [f.id, form.fields[f.id as keyof FormValues]]
      )
    );
    console.log(`[${stepId}] continue — posting:`, { step: stepId, value: stepFields });
    setStepLoading(true);
    try {
      const data = await postStepData(stepId, stepFields);
      console.log(`[${stepId}] post success:`, data);
    } catch (err) {
      console.error(`[${stepId}] post error:`, err instanceof Error ? err.message : err);
    } finally {
      setStepLoading(false);
      setCompletedIds((prev) => [...prev, stepId]);
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
      const data = await submitFormData({
        ...form.fields,
        dob: `${form.fields.dob.day}/${form.fields.dob.month}/${form.fields.dob.year}`,
      });
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
        const { dob, ...stringFields } = form.fields;
        const summaryValues = {
          ...stringFields,
          dob: `${dob.day}/${dob.month}/${dob.year}`,
        };

        return (
          <fieldset
            key={step.id}
            disabled={!isCompleted && !isActive}
            className={classNames(styles.fieldset, { [styles.active]: isActive })}
          >
            <legend className={styles.legend}>{step.label}</legend>
            {isCompleted && (
              <div className={styles.completedRow}>
                <p className={styles.completedValue}>{step.summarise(summaryValues)}</p>
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
