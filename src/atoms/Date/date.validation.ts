type ContactForDateOfBirth = 'student' | 'guarantor'

type DateOfBirthValue = { day: string; month: string; year: string }

export type DateErrors = { day?: string; month?: string; year?: string }

type ValidateDateOfBirthOptions = {
  minYearOfBirth: number
  maxYearOfBirth: number
  contactType: ContactForDateOfBirth
}

const VALID_TWO_DIGIT_REGEX = /^\d{2}$/
const VALID_FOUR_DIGIT_REGEX = /^\d{4}$/
const MIN_AGE_FOR_GUARANTOR = 18

const isValidDate = (day: string, month: string, year: string) => {
  const d = parseInt(day, 10)
  const m = parseInt(month, 10) - 1
  const y = parseInt(year, 10)
  const date = new Date(y, m, d)
  return date.getFullYear() === y && date.getMonth() === m && date.getDate() === d
}

const calculateAge = (day: string, month: string, year: string) => {
  const birthDate = new Date(`${year}-${month}-${day}`)
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const hasHadBirthday =
    today.getMonth() > birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate())
  if (!hasHadBirthday) age--
  return age
}

const validateDay = (day: string): string | undefined => {
  const validDayRegex = /^(0[1-9]|[12][0-9]|3[01])$/
  if (!day) return 'Date of birth must include day'
  if (!/^\d+$/.test(day)) return 'Day must be 2 digits'
  if (day.length < 2) return 'Day must include 2 digits'
  if (!VALID_TWO_DIGIT_REGEX.test(day)) return 'Day must be 2 digits'
  if (!validDayRegex.test(day)) return 'Day must be a real date'
}

const validateMonth = (month: string): string | undefined => {
  const validMonthRegex = /^(0[1-9]|1[0-2])$/
  if (!month) return 'Date of birth must include month'
  if (!/^\d+$/.test(month)) return 'Month must be 2 digits'
  if (month.length < 2) return 'Month must include 2 digits'
  if (!VALID_TWO_DIGIT_REGEX.test(month)) return 'Month must be 2 digits'
  if (!validMonthRegex.test(month)) return 'Month must be a real date'
}

const validateYear = (year: string, minYearOfBirth: number, maxYearOfBirth: number): string | undefined => {
  const yearAsNumber = Number(year)
  if (!year) return 'Date of birth must include year'
  if (!/^\d+$/.test(year)) return 'Year must be 4 digits'
  if (year.length < 4) return 'Year must include 4 digits'
  if (!VALID_FOUR_DIGIT_REGEX.test(year)) return 'Year must be 4 digits'
  if (yearAsNumber < minYearOfBirth) return `Year must be greater than or equal to ${minYearOfBirth}`
  if (yearAsNumber > maxYearOfBirth) return `Year must be less than or equal to ${maxYearOfBirth}`
}

export const validateDateOfBirth = (
  { day, month, year }: DateOfBirthValue,
  { minYearOfBirth, maxYearOfBirth, contactType }: ValidateDateOfBirthOptions
): { errors: DateErrors; isValid: boolean } => {
  if (!day && !month && !year) {
    return { errors: { day: 'Please enter date of birth', month: '', year: '' }, isValid: false }
  }

  const errors: DateErrors = {
    day: validateDay(day),
    month: validateMonth(month),
    year: validateYear(year, minYearOfBirth, maxYearOfBirth),
  }

  const allFieldsPresent = !!day && !!month && !!year
  const allFieldsIndividuallyValid = !errors.day && !errors.month && !errors.year

  if (allFieldsPresent && allFieldsIndividuallyValid && !isValidDate(day, month, year)) {
    return { errors: { day: 'Date of birth must be a real date', month: '', year: '' }, isValid: false }
  }

  if (contactType === 'guarantor' && allFieldsPresent && allFieldsIndividuallyValid) {
    const age = calculateAge(day, month, year)
    if (age < MIN_AGE_FOR_GUARANTOR) {
      return { errors: { day: `Guarantor must be at least ${MIN_AGE_FOR_GUARANTOR} years old`, month: '', year: '' }, isValid: false }
    }
  }

  const isValid = !errors.day && !errors.month && !errors.year
  return { errors, isValid }
}
