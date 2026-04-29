import { validateDateOfBirth } from "./date.validation";
import {
	MAX_YEAR_OF_BIRTH_FOR_STUDENT,
	MIN_YEAR_OF_BIRTH,
} from "../../../constants/ages";

describe("validation", () => {
	describe("validateDateOfBirth", () => {
		const validDob = {
			day: "15",
			month: "06",
			year: "1999",
		};
		const options = {
			minYearOfBirth: MIN_YEAR_OF_BIRTH,
			maxYearOfBirth: MAX_YEAR_OF_BIRTH_FOR_STUDENT,
			contactType: "student" as const,
		};

		it("passes for a valid date of birth", () => {
			const result = validateDateOfBirth(validDob, options);
			expect(result.isValid).toBe(true);
		});

		it("fails when the year is too long ago", () => {
			const result = validateDateOfBirth({ ...validDob, year: "1900" }, options);

			expect(result.isValid).toBe(false);
			expect(result.errors.year).toEqual(
				`Year must be greater than or equal to ${MIN_YEAR_OF_BIRTH}`,
			);
		});

		it("fails when the year is too recent", () => {
			const result = validateDateOfBirth(
				{ ...validDob, year: new Date().getFullYear().toString() },
				options,
			);

			expect(result.isValid).toBe(false);
			expect(result.errors.year).toEqual(
				`Year must be less than or equal to ${MAX_YEAR_OF_BIRTH_FOR_STUDENT}`,
			);
		});

		it("fails with the correct message when the day is missing and the rest of the date is valid", () => {
			const result = validateDateOfBirth({ ...validDob, day: "" }, options);

			expect(result.isValid).toBe(false);
			expect(result.errors.day).toEqual("Date of birth must include day");
			expect(result.errors.month).toBeFalsy();
			expect(result.errors.year).toBeFalsy();
		});

		it("fails with the correct message when the day is less than two digits and the rest of the date is valid", () => {
			const result = validateDateOfBirth({ ...validDob, day: "1" }, options);

			expect(result.isValid).toBe(false);
			expect(result.errors.day).toEqual("Day must include 2 digits");
			expect(result.errors.month).toBeFalsy();
			expect(result.errors.year).toBeFalsy();
		});

		it("fails with the correct message when the month is missing and the rest of the date is valid", () => {
			const result = validateDateOfBirth({ ...validDob, month: "" }, options);

			expect(result.isValid).toBe(false);
			expect(result.errors.month).toEqual("Date of birth must include month");
			expect(result.errors.day).toBeFalsy();
			expect(result.errors.year).toBeFalsy();
		});

		it("fails with the correct message when the month is less than two digits and the rest of the date is valid", () => {
			const result = validateDateOfBirth({ ...validDob, month: "1" }, options);

			expect(result.isValid).toBe(false);
			expect(result.errors.month).toEqual("Month must include 2 digits");
			expect(result.errors.day).toBeFalsy();
			expect(result.errors.year).toBeFalsy();
		});

		it("fails with the correct message when the year is missing and the rest of the date is valid", () => {
			const result = validateDateOfBirth({ ...validDob, year: "" }, options);

			expect(result.isValid).toBe(false);
			expect(result.errors.year).toEqual("Date of birth must include year");
			expect(result.errors.day).toBeFalsy();
			expect(result.errors.month).toBeFalsy();
		});

		it("fails with the correct message when the year is less than four digits and the rest of the date is valid", () => {
			const result = validateDateOfBirth({ ...validDob, year: "19" }, options);

			expect(result.isValid).toBe(false);
			expect(result.errors.year).toEqual("Year must include 4 digits");
			expect(result.errors.day).toBeFalsy();
			expect(result.errors.month).toBeFalsy();
		});

		it("fails with the correct messages when the day and month are missing", () => {
			const result = validateDateOfBirth(
				{ ...validDob, day: "", month: "" },
				options,
			);

			expect(result.isValid).toBe(false);
			expect(result.errors.day).toEqual("Date of birth must include day");
			expect(result.errors.month).toEqual("Date of birth must include month");
			expect(result.errors.year).toBeFalsy();
		});

		it("fails with the correct message for logically invalid date values", () => {
			const result = validateDateOfBirth(
				{ day: "31", month: "02", year: "2001" },
				options,
			);

			expect(result.isValid).toBe(false);
			expect(result.errors.day).toEqual("Date of birth must be a real date");
			expect(result.errors.month).toEqual("");
			expect(result.errors.year).toEqual("");
		});

		it("fails with the correct message for completely missing date values", () => {
			const result = validateDateOfBirth(
				{ day: "", month: "", year: "" },
				options,
			);

			expect(result.isValid).toBe(false);
			expect(result.errors.day).toEqual("Please enter date of birth");
			expect(result.errors.month).toEqual("");
			expect(result.errors.year).toEqual("");
		});
	});
});
