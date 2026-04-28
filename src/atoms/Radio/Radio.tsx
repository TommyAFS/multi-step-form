import styles from "./Radio.module.css";

type RadioProps = {
  label: string;
  value: string;
  name: string;
  checked?: boolean;
  onChange?: (value: string) => void;
};

export default function Radio({ label, value, name, checked, onChange }: RadioProps) {
  return (
    <label className={styles.label}>
      <input
        className={styles.input}
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
