import styles from './PersonalFormSimple.module.css'

type TProps = {
  ecFirstName: string 
  ecLastName: string 
  ecEmail?: string 
  ecPhone?: string
}

export const GuarantoDetails = ({ ecFirstName, ecLastName, ecEmail, ecPhone }: TProps) => {
 
  return (
    <div className={styles.guarantorSummary}>
      <p className={styles.guarantorSummaryName}>
        {[ecFirstName, ecLastName].filter(Boolean).join(" ")}
      </p>
      {ecEmail && (
        <p className={styles.guarantorSummaryDetail}>{ecEmail}</p>
      )}
      {ecPhone && (
        <p className={styles.guarantorSummaryDetail}>{ecPhone}</p>
      )}
    </div>
  )
}
