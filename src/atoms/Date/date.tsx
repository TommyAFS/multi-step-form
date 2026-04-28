import Input from "../Input/Input";

type DateOfBirthValue = {
  day: string;
  month: string;
  year: string;
};

type FieldDateOfBirthProps = {
  id: string;
  value: DateOfBirthValue;
  onChange: (value: DateOfBirthValue) => void;
  onBlur?: () => void;
  error?: string;
  className?: string;
};

export default function FieldDateOfBirth({ id, value, onChange, onBlur, error, className }: FieldDateOfBirthProps) {
  return (
    <div className={className}>
      <Input
        id={`${id}-day`}
        label="Day"
        value={value.day}
        onChange={(day) => onChange({ ...value, day })}
        onBlur={onBlur ? () => onBlur() : undefined}
        autoComplete="bday-day"
      />
      <Input
        id={`${id}-month`}
        label="Month"
        value={value.month}
        onChange={(month) => onChange({ ...value, month })}
        onBlur={onBlur ? () => onBlur() : undefined}
        autoComplete="bday-month"
      />
      <Input
        id={`${id}-year`}
        label="Year"
        value={value.year}
        onChange={(year) => onChange({ ...value, year })}
        onBlur={onBlur ? () => onBlur() : undefined}
        autoComplete="bday-year"
      />
      {error && <p>{error}</p>}
    </div>
  );
}
