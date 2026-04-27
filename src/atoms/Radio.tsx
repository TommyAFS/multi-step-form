type RadioProps = {
  label: string;
  value: string;
  name: string;
  checked?: boolean;
  onChange?: (value: string) => void;
};

export default function Radio({ label, value, name, checked, onChange }: RadioProps) {
  return (
    <label>
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange?.(value)}
      />
      {label}
    </label>
  );
}
