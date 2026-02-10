import { AppError } from "../../../utils/AppError.js";
import { BAD_REQUEST } from "../../../utils/constants.js";

export default function validateMandatoryFields({ data, MANDATORY_FIELDS }) {
  for (const field of Object.values(MANDATORY_FIELDS)) {
    const value = data[field.key];

    if (value === null || value === undefined || value === "") {
      throw new AppError(`${field.label} is required.`, BAD_REQUEST);
    }
  }
}
