import { useState } from "react";
import classNames from "classnames";
import Input from "@/atoms/Input/Input";
import Select from "@/atoms/Select/Select";
import Radio from "@/atoms/Radio/Radio";
import FieldDateOfBirth from "@/atoms/Date/date";
import { validateDateOfBirth } from "@/atoms/Date/date.validation";
import { steps } from "./simpleSteps";
import type { StepDefinition } from "./simpleSteps";
import { type SubmitState, postStepData, submitFormData } from "@/lib/formHelpers";
import styles from "./PersonalFormSimple.module.css";

type DateOfBirthValue = { day: string; month: string; year: string };

type FieldRule = {
  required?: string;
  pattern?: { value: RegExp; message: string };
};

const validationRules: Record<string, FieldRule> = {
  firstName:          { required: "First name is required" },
  lastName:           { required: "Last name is required" },
  email:              { required: "Email is required", pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email address" } },
  phone:              { required: "Phone number is required", pattern: { value: /^\d+$/, message: "Enter a valid phone number" } },
  gender:             { required: "Please select a gender" },
  country:            { required: "Please select a country" },
  yearOfStudy:        { required: "Please select a year of study" },
  university:         { required: "University is required" },
  courseName:         { required: "Course title is required" },
  ecRelationship:     { required: "Please select a relationship" },
  ecFirstName:        { required: "First name is required" },
  ecLastName:         { required: "Last name is required" },
  ecEmail:            { required: "Email address is required", pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email address" } },
  ecPhone:            { required: "Phone number is required", pattern: { value: /^\d+$/, message: "Enter a valid phone number" } },
  ecCountry:          { required: "Please select a country" },
  hasGuarantor:       { required: "Please select an option" },
  guarantorSameAsEC:  { required: "Please select an option" },
  cardNumber:         { required: "Card number is required" },
  cardExpiry:         { required: "Expiry date is required" },
  cardCvv:            { required: "Security code is required" },
  billingCountry:     { required: "Please select a country" },
  billingPostcode:    { required: "Postcode is required" },
};

function validate(fieldId: string, value: string): string {
  const rule = validationRules[fieldId];
  if (!rule) return "";
  if (rule.required && !value.trim()) return rule.required;
  if (rule.pattern && !rule.pattern.value.test(value.trim())) return rule.pattern.message;
  return "";
}

type ActiveStepProps = {
  step: StepDefinition;
  values: Record<string, string>;
  errors: Record<string, string>;
  onChange: (fieldId: string, value: string) => void;
  onContinue: () => void;
  stepLoading: boolean;
  dobValues: Record<string, DateOfBirthValue>;
  onDobChange: (fieldId: string, value: DateOfBirthValue) => void;
};

function renderField(field: StepDefinition["fields"][number], props: ActiveStepProps) {
  if (field.id === "guarantorSameAsEC" && props.values.hasGuarantor !== "yes") {
    return null;
  }

  if (field.type === "dob") {
    return (
      <FieldDateOfBirth
        key={field.id}
        id={field.id}
        label={field.label}
        value={props.dobValues[field.id] ?? { day: "", month: "", year: "" }}
        onChange={(value) => props.onDobChange(field.id, value)}
        error={props.errors[field.id] || undefined}
      />
    );
  }

  if (field.type === "radio") {
    return (
      <div key={field.id}>
        <p className={styles.radioGroupLabel}>{field.label}</p>
        <div className={styles.radioGroup}>
          {(field.options ?? []).map((option) => (
            <Radio
              key={option.value}
              name={field.id}
              value={option.value}
              label={option.label}
              checked={props.values[field.id] === option.value}
              onChange={(value) => props.onChange(field.id, value)}
            />
          ))}
        </div>
      </div>
    );
  }

  if (field.type === "select") {
    return (
      <Select
        key={field.id}
        id={field.id}
        label={field.label}
        value={props.values[field.id] ?? ""}
        options={field.options ?? []}
        onChange={(value) => props.onChange(field.id, value)}
        error={props.errors[field.id] || undefined}
      />
    );
  }

  return (
    <Input
      key={field.id}
      id={field.id}
      label={field.label}
      type={field.type}
      value={props.values[field.id] ?? ""}
      onChange={(value) => props.onChange(field.id, value)}
      error={props.errors[field.id] || undefined}
      autoComplete={field.autoComplete}
      className={field.half ? styles.half : undefined}
    />
  );
}

function ActiveStep(props: ActiveStepProps) {
  const { step, onContinue, stepLoading } = props;
  return (
    <div className={styles.fields}>
      {step.fields.map((field) => renderField(field, props))}
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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dobValues, setDobValues] = useState<Record<string, DateOfBirthValue>>({});
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [stepLoading, setStepLoading] = useState(false);
  const [submitState, setSubmitState] = useState<SubmitState>({ status: "idle" });

  const activeStepIndex = steps.findIndex((step) => !completedIds.includes(step.id));
  const isComplete = activeStepIndex === -1;

  function handleChange(fieldId: string, value: string) {
    setValues((previous) => ({ ...previous, [fieldId]: value }));
    if (errors[fieldId] !== undefined) {
      setErrors((previous) => ({ ...previous, [fieldId]: validate(fieldId, value) }));
    }
  }

  function handleDobChange(fieldId: string, value: DateOfBirthValue) {
    setDobValues((previous) => ({ ...previous, [fieldId]: value }));
  }

  async function handleContinue(step: (typeof steps)[number]) {
    const stepErrors: Record<string, string> = {};
    let hasError = false;

    for (const field of step.fields) {
      if (field.type === "dob") {
        const dobValue = dobValues[field.id] ?? { day: "", month: "", year: "" };
        const result = validateDateOfBirth(dobValue, { minYearOfBirth: 1900, maxYearOfBirth: 2010, contactType: "student" });
        stepErrors[field.id] = result.isValid ? "" : (result.errors.day || result.errors.month || result.errors.year || "");
        if (!result.isValid) hasError = true;
        continue;
      }

      const errorMessage = validate(field.id, values[field.id] ?? "");
      stepErrors[field.id] = errorMessage;
      if (errorMessage) hasError = true;
    }

    setErrors((previous) => ({ ...previous, ...stepErrors }));

    if (!hasError) {
      const stepFields = Object.fromEntries(
        step.fields.map((field) => {
          if (field.type === "dob") {
            const dobValue = dobValues[field.id] ?? { day: "", month: "", year: "" };
            return [field.id, `${dobValue.day}/${dobValue.month}/${dobValue.year}`];
          }
          return [field.id, values[field.id] ?? ""];
        })
      );

      if (step.id === "guarantor" && values.guarantorSameAsEC === "yes") {
        stepFields.guarantorFirstName = values.ecFirstName ?? "";
        stepFields.guarantorLastName = values.ecLastName ?? "";
        stepFields.guarantorEmail = values.ecEmail ?? "";
        stepFields.guarantorPhone = values.ecPhone ?? "";
      }

      console.log(`[${step.id}] continue — posting:`, { step: step.id, value: stepFields });
      setStepLoading(true);

      try {
        const data = await postStepData(step.id, stepFields);
        console.log(`[${step.id}] post success:`, data);
      } catch (error) {
        console.error(`[${step.id}] post error:`, error instanceof Error ? error.message : error);
      } finally {
        setStepLoading(false);
        setCompletedIds((previous) => [...previous, step.id]);
      }
    }
  }

  function handleEdit(fromIndex: number) {
    setCompletedIds((previous) => previous.slice(0, fromIndex));
    setSubmitState({ status: "idle" });
  }

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitState({ status: "loading" });

    const serialisedDobValues = Object.fromEntries(
      Object.entries(dobValues).map(([fieldId, dob]) => [fieldId, `${dob.day}/${dob.month}/${dob.year}`])
    );

    try {
      const data = await submitFormData({ ...values, ...serialisedDobValues });
      console.log("[submit] response:", data);
      setSubmitState({ status: "success", data });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error("[submit] error:", message);
      setSubmitState({ status: "error", message });
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {steps.map((step, index) => {
        const isCompleted = completedIds.includes(step.id);
        const isActive = index === activeStepIndex;

        const serialisedDobValues = Object.fromEntries(
          Object.entries(dobValues).map(([fieldId, dob]) => [fieldId, `${dob.day}/${dob.month}/${dob.year}`])
        );
        const summaryValues = { ...values, ...serialisedDobValues };

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
                values={values}
                errors={errors}
                onChange={handleChange}
                onContinue={() => handleContinue(step)}
                stepLoading={stepLoading}
                dobValues={dobValues}
                onDobChange={handleDobChange}
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
