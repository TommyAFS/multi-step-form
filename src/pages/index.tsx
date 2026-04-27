import { useState } from "react";
import Layout from "@/templates/Layout";
import Radio from "@/atoms/Radio";
import formContentRaw from "../../formContent.json";

type RadioOption = {
  id: string;
  label: string;
  dateRange?: string;
  pricePerWeek?: number;
};

type OptionsStep = {
  id: string;
  label: string;
  type: string;
  options: RadioOption[];
};

type GroupsStep = {
  id: string;
  label: string;
  type: string;
  groups: { id: string; label: string; count: number; options: RadioOption[] }[];
};

type Step = OptionsStep | GroupsStep;

const formContent = formContentRaw as { steps: Step[] };

type Selections = Record<string, string>;

function getOptionLabel(option: RadioOption): string {
  const parts = [option.label];
  if (option.dateRange) parts.push(option.dateRange);
  if (option.pricePerWeek) parts.push(`£${option.pricePerWeek}/week`);
  return parts.join(" — ");
}

function getSelectedLabel(step: Step, selectedId: string): string {
  if ("groups" in step) {
    for (const group of step.groups) {
      const matchedOption = group.options.find((option) => option.id === selectedId);
      if (matchedOption) return getOptionLabel(matchedOption);
    }
    return selectedId;
  }
  const matchedOption = step.options.find((option) => option.id === selectedId);
  return matchedOption ? getOptionLabel(matchedOption) : selectedId;
}

type ActiveStepProps = {
  step: Step;
  selected: string | undefined;
  onSelect: (value: string) => void;
};

function ActiveStep({ step, selected, onSelect }: ActiveStepProps) {
  if ("groups" in step) {
    return step.groups.map((group) => (
      <div key={group.id}>
        <p>
          {group.label} ({group.count})
        </p>
        {group.options.map((option) => (
          <Radio
            key={option.id}
            name={step.id}
            value={option.id}
            label={getOptionLabel(option)}
            checked={selected === option.id}
            onChange={onSelect}
          />
        ))}
      </div>
    ));
  }

  return step.options.map((option) => (
    <Radio
      key={option.id}
      name={step.id}
      value={option.id}
      label={getOptionLabel(option)}
      checked={selected === option.id}
      onChange={onSelect}
    />
  ));
}

export default function Home() {
  const [selections, setSelections] = useState<Selections>({});

  const activeStepIndex = formContent.steps.findIndex(
    (step) => !selections[step.id]
  );

  function handleSelect(stepId: string, selectedValue: string) {
    setSelections((previousSelections) => ({ ...previousSelections, [stepId]: selectedValue }));
  }

  function handleEdit(fromIndex: number) {
    setSelections((previousSelections) => {
      const updatedSelections = { ...previousSelections };
      formContent.steps.slice(fromIndex).forEach((step) => delete updatedSelections[step.id]);
      return updatedSelections;
    });
  }

  return (
    <Layout>
      <form>
        {formContent.steps.map((step, index) => {
          const isCompleted = !!selections[step.id];
          const isActive = index === activeStepIndex;

          if (isCompleted) {
            return (
              <fieldset key={step.id}>
                <legend>{step.label}</legend>
                <p>{getSelectedLabel(step, selections[step.id])}</p>
                <button type="button" onClick={() => handleEdit(index)}>
                  Edit
                </button>
              </fieldset>
            );
          }

          if (isActive) {
            return (
              <fieldset key={step.id}>
                <legend>{step.label}</legend>
                <ActiveStep
                  step={step}
                  selected={selections[step.id]}
                  onSelect={(selectedValue) => handleSelect(step.id, selectedValue)}
                />
              </fieldset>
            );
          }

          return (
            <fieldset key={step.id} disabled>
              <legend>{step.label}</legend>
            </fieldset>
          );
        })}
      </form>
    </Layout>
  );
}
