import styles from "./Input.module.css";

type InputProps = {
  label: string;
  id: string;
  type?: "text" | "email" | "tel" | "date";
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  autoComplete?: string;
  className?: string;
};

export default function Input({ label, id, type = "text", value, onChange, required, autoComplete, className }: InputProps) {
  return (
    <div className={[styles.field, className].filter(Boolean).join(" ")}>
      <label className={styles.label} htmlFor={id}>{label}</label>
      <input
        className={styles.input}
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        autoComplete={autoComplete}
      />
    </div>
  );
}
