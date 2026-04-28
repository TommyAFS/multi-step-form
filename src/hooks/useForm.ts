import { ChangeEvent, FocusEvent, FormEvent, useState } from "react";

type Validations<T extends {}> = Partial<Record<keyof T, Validation<T>>>;
type ErrorRecord<T> = Partial<Record<keyof T, string>>;
type TouchedRecord<T> = Partial<Record<keyof T, boolean>>;

interface Validation<T> {
	required?: {
		value: boolean;
		message: string;
	};
	pattern?: {
		value: RegExp;
		message: string;
	};
	custom?: (value: keyof T) => {
		isValid: boolean;
		message: string;
	};
}

export const useForm = <T extends Record<keyof T, any> = {}>(options: {
	validations?: Validations<T>;
	initialValues: Partial<T>;
	onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
}) => {
	const initialTouched = Object.keys(options.initialValues).reduce(
		(obj, key) => ({ ...obj, [key]: false }),
		{} as TouchedRecord<T>,
	);
	const initialError = Object.keys(options.initialValues).reduce(
		(obj, key) => ({ ...obj, [key]: "" }),
		{} as ErrorRecord<T>,
	);
	const [fields, setFields] = useState<T>(options.initialValues as T);
	const [touched, setTouched] = useState<TouchedRecord<T>>(initialTouched);
	const [errors, setErrors] = useState<ErrorRecord<T>>(initialError);

	// Setters
	const validateField = (key: keyof T, newField: T) => {
		const validation = options?.validations?.[key];
		let error = "";

		if (validation?.required?.value && !newField[key]) {
			error = validation.required.message;
		}

		const pattern = validation?.pattern;
		if (pattern?.value && !RegExp(pattern.value).test(newField[key])) {
			error = pattern.message;
		}

		const custom = validation?.custom;
		if (custom && !custom(newField[key]).isValid) {
			error = custom(newField[key]).message;
		}

		setErrors((prevErrors) => ({ ...prevErrors, [key]: error }));
		return { isValid: !error };
	};

	const validateAllFields = () => {
		let isValid = true;
		for (let key in fields) {
			const fieldValidation = validateField(key, fields);
			if (!fieldValidation.isValid) {
				isValid = false;
			}
		}
		return isValid;
	};

	const updateField = (field: keyof T, value: T[keyof T]) => {
		const newFields = {
			...fields,
			[field]: value,
		};

		setFields(newFields);
		validateField(field, newFields);
		setTouched((prevTouched) => ({ ...prevTouched, [field]: true }));
	};

	const updateFields = (newFields: T) => {
		setFields(newFields);

		for (let key in newFields) {
			validateField(key, newFields);
			setTouched((prevTouched) => ({ ...prevTouched, [key]: true }));
		}
	};

	const setAllTouched = () => {
		setTouched(
			Object.keys(fields).reduce(
				(obj, key) => ({ ...obj, [key]: true }),
				{} as TouchedRecord<T>,
			),
		);
	};

	const validateForm = () => {
		setAllTouched();
		return validateAllFields();
	};

	const resetForm = () => {
		setFields(options.initialValues as T);
		setErrors(initialError);
		setTouched(initialTouched);
	};

	// Handlers
	const handleChange =
		(key: keyof T, isCheckbox?: boolean) =>
		(e: ChangeEvent<HTMLInputElement>) => {
			const updatedValues = isCheckbox ? e.target.checked : e.target.value;
			const newField = { ...fields, [key]: updatedValues };

			setFields(newField);
			validateField(key, newField);
		};

	const handleBlur =
		(key: keyof T) => (e: FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
			!touched[key] && setTouched({ ...touched, [key]: true });
			const newFields = { ...fields, [key]: e.target.value };
			validateField(key, newFields);
		};

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const allFieldsAreValid = validateForm();
		if (allFieldsAreValid && options?.onSubmit) {
			options.onSubmit(e);
		}
	};

	// Getters
	const isFieldValid = (key: keyof T) => {
		if (!touched[key]) return true;
		return touched[key] && !errors[key];
	};

	const isFormValid = () => {
		for (const key in fields) {
			if (!isFieldValid(key)) {
				return false;
			}
		}
		return true;
	};

	return {
		fields,
		errors,
		resetForm,
		setFields,
		handleBlur,
		updateField,
		updateFields,
		validateForm,
		isFormValid,
		handleChange,
		handleSubmit,
		isFieldValid,
	};
};
