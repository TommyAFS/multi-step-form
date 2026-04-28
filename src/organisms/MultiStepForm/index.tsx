import { useState } from "react";
import classNames from "classnames";
import Radio from "@/atoms/Radio";
import type { Step, Selections } from "./types";
import { formContent, formatOption, allOptions, selectedLabel } from "./helpers";
import { type SubmitState, postStepData, submitFormData } from "@/lib/formHelpers";
import styles from "./MultiStepForm.module.css";

function ActiveStep({ step, selected, onSelect }: {
  step: Step;
  selected: string | undefined;
  onSelect: (value: string) => void;
}) {
  if (step.groups) {
    return (
      <div className={styles.options}>
        {step.groups.map((group) => (
          <div key={group.id} className={styles.group}>
            <p className={styles.groupLabel}>{group.label} ({group.count})</p>
            {group.options.map((option) => (
              <Radio
                key={option.id}
                name={step.id}
                value={option.id}
                label={formatOption(option)}
                checked={selected === option.id}
                onChange={onSelect}
              />
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={styles.options}>
      {allOptions(step).map((option) => (
        <Radio
          key={option.id}
          name={step.id}
          value={option.id}
          label={formatOption(option)}
          checked={selected === option.id}
          onChange={onSelect}
        />
      ))}
    </div>
  );
}

export default function MultiStepForm() {
  const [selections, setSelections] = useState<Selections>({});
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [stepLoading, setStepLoading] = useState(false);
  const [submitState, setSubmitState] = useState<SubmitState>({ status: "idle" });

  const isComplete = activeStepIndex >= formContent.steps.length;

  function handleSelect(stepId: string, value: string) {
    setSelections((prev) => ({ ...prev, [stepId]: value }));
  }

  function handleEdit(fromIndex: number) {
    setSelections((prev) => {
      const next = { ...prev };
      formContent.steps.slice(fromIndex).forEach(({ id }) => delete next[id]);
      return next;
    });
    setActiveStepIndex(fromIndex);
    setSubmitState({ status: "idle" });
  }

  async function handleContinue(step: Step) {
    const value = selections[step.id];
    console.log(`[${step.id}] continue — posting:`, { step: step.id, value });
    setStepLoading(true);
    try {
      const data = await postStepData(step.id, value);
      console.log(`[${step.id}] post success:`, data);
    } catch (err) {
      console.error(`[${step.id}] post error:`, err instanceof Error ? err.message : err);
    } finally {
      setStepLoading(false);
      setActiveStepIndex((i) => i + 1);
    }
  }

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitState({ status: "loading" });
    try {
      const data = await submitFormData(selections);
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
      {formContent.steps.map((step, index) => {
        const isCompleted = index < activeStepIndex;
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
                <p className={styles.completedValue}>{selectedLabel(step, selections[step.id])}</p>
                <button type="button" className={styles.editButton} onClick={() => handleEdit(index)}>Edit</button>
              </div>
            )}
            {isActive && (
              <>
                <ActiveStep
                  step={step}
                  selected={selections[step.id]}
                  onSelect={(value) => handleSelect(step.id, value)}
                />
                <button
                  type="button"
                  className={styles.continueButton}
                  disabled={!selections[step.id] || stepLoading}
                  onClick={() => handleContinue(step)}
                >
                  {stepLoading ? "Saving…" : "Continue"}
                </button>
              </>
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
