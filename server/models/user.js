import mongoose, { Schema } from "mongoose";
import validator from "validator";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, "User name is required."],
      unique: true,
    },
    email: {
      type: String,
      required: [true, "Email address is required."],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: (value) => {
          return validator.isEmail(value);
        },
        message: (props) => {
          `${props.value} is not a valid email address.`;
        },
      },
    },
    adress: {
      type: String,
    },
    password: {
      type: String,
      required: [true, "Password is required."],
      validate: {
        validator: (value) => {
          return validator.isStrongPassword(value);
        },
        message: (props) => {
          `${props.value} is not a strong password.`;
        },
      },
    },
    profilePicture: {
      type: String,
      default:
        "https://media.istockphoto.com/id/1316420668/vector/user-icon-human-person-symbol-social-profile-icon-avatar-login-sign-web-user-symbol.jpg?s=612x612&w=0&k=20&c=AhqW2ssX8EeI2IYFm6-ASQ7rfeBWfrFFV4E87SaFhJE=",
    },
    isUser: {
      type: Boolean,
      default: false,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    isVendor: {
      type: Boolean,
      default: false,
    },
    refreshToken: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);

export default User;
