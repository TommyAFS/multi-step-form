import styles from "./Select.module.css";

type SelectOption = { value: string; label: string };

type SelectProps = {
  label: string;
  id: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
};

export default function Select({ label, id, value, options, onChange }: SelectProps) {
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>{label}</label>
      <select
        className={styles.select}
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="" disabled>Select…</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}
