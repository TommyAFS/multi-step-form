import { useState } from "react";
import classNames from "classnames";
import Radio from "@/atoms/Radio";
import type { Step, Selections } from "./types";
import { formContent, formatOption, allOptions, selectedLabel } from "./helpers";
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

type SubmitState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: unknown }
  | { status: "error"; message: string };

export default function MultiStepForm() {
  const [selections, setSelections] = useState<Selections>({});
  const [submitState, setSubmitState] = useState<SubmitState>({ status: "idle" });

  const activeStepIndex = formContent.steps.findIndex((step) => !selections[step.id]);
  const isComplete = activeStepIndex === -1;

  function handleSelect(stepId: string, value: string) {
    setSelections((prev) => {
      const next = { ...prev, [stepId]: value };
      console.log(`[${stepId}] selected:`, value, '| form data:', next);
      return next;
    });
  }

  function handleEdit(fromIndex: number) {
    setSelections((prev) => {
      const next = { ...prev };
      formContent.steps.slice(fromIndex).forEach(({ id }) => delete next[id]);
      return next;
    });
    setSubmitState({ status: "idle" });
  }

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitState({ status: "loading" });
    try {
      const res = await fetch("https://httpbin.org/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selections),
      });
      const data = await res.json();
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
        const isCompleted = !!selections[step.id];
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
              <ActiveStep
                step={step}
                selected={selections[step.id]}
                onSelect={(value) => handleSelect(step.id, value)}
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
