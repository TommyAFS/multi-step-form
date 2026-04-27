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

export default function MultiStepForm() {
  const [selections, setSelections] = useState<Selections>({});
  

  const activeStepIndex = formContent.steps.findIndex((step) => !selections[step.id]);

  function handleSelect(stepId: string, value: string) {
    setSelections((prev) => ({ ...prev, [stepId]: value }));
  }

  function handleEdit(fromIndex: number) {
    setSelections((prev) => {
      const next = { ...prev };
      formContent.steps.slice(fromIndex).forEach(({ id }) => delete next[id]);
      return next;
    });
  }

  return (
    <form className={styles.form}>
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
    </form>
  );
}
