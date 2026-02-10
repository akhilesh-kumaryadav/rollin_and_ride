import validator from "validator";

import validateMandatoryFields from "./validateMandatoryFields.js";
import { AppError } from "../../../utils/AppError.js";
import { BAD_REQUEST } from "../../../utils/constants.js";

const MANDATORY_FIELDS = {
  username: {
    key: "username",
    label: "User Name",
  },
  email: {
    key: "email",
    label: "Email Address",
  },
  password: {
    key: "password",
    label: "Password",
  },
  // phoneNumber: {
  //     key: 'phoneNumber',
  //     label: 'Phone Number'
  // }
};

export default function signUpValidator({ bodyParams }) {
  validateMandatoryFields({ data: bodyParams, MANDATORY_FIELDS });

  const { email, password } = bodyParams;

  if (!validator.isEmail(email)) {
    throw new AppError("Email address is not valid.", BAD_REQUEST);
  }

  if (!validator.isStrongPassword(password)) {
    throw new AppError("Password is not strong.", BAD_REQUEST);
  }
}
