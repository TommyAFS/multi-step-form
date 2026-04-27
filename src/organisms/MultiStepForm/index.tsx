import { useState } from "react";
import Radio from "@/atoms/Radio";
import type { Step, Selections } from "./types";
import { formContent, formatOption, allOptions, selectedLabel } from "./helpers";

function ActiveStep({ step, selected, onSelect }: {
  step: Step;
  selected: string | undefined;
  onSelect: (value: string) => void;
}) {
  if (step.groups) {
    return step.groups.map((group) => (
      <div key={group.id}>
        <p>{group.label} ({group.count})</p>
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
    ));
  }

  return allOptions(step).map((option) => (
    <Radio
      key={option.id}
      name={step.id}
      value={option.id}
      label={formatOption(option)}
      checked={selected === option.id}
      onChange={onSelect}
    />
  ));
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
    <form>
      {formContent.steps.map((step, index) => {
        const isCompleted = !!selections[step.id];
        const isActive = index === activeStepIndex;

        return (
          <fieldset key={step.id} disabled={!isCompleted && !isActive}>
            <legend>{step.label}</legend>
            {isCompleted && (
              <>
                <p>{selectedLabel(step, selections[step.id])}</p>
                <button type="button" onClick={() => handleEdit(index)}>Edit</button>
              </>
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
