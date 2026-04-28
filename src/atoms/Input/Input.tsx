import styles from "./Input.module.css";

type InputProps = {
  label: string;
  id: string;
  type?: "text" | "email" | "tel" | "date";
  value: string;
  onChange: (value: string) => void;
  onBlur?: (value: string) => void;
  error?: string;
  required?: boolean;
  autoComplete?: string;
  className?: string;
};

export default function Input({ label, id, type = "text", value, onChange, onBlur, error, required, autoComplete, className }: InputProps) {
  return (
    <div className={[styles.field, className].filter(Boolean).join(" ")}>
      <label className={styles.label} htmlFor={id}>{label}</label>
      <input
        className={[styles.input, error ? styles.inputError : undefined].filter(Boolean).join(" ")}
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur ? (e) => onBlur(e.target.value) : undefined}
        required={required}
        autoComplete={autoComplete}
      />
      {error && <p className={styles.errorMessage}>{error}</p>}
    </div>
  );
}
