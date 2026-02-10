import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../../models/user.js";
import { errorHandler } from "../../utils/error.js";
import signUpValidator from "./helpers/signUpValidator.js";
import { NOT_FOUND, OK, UNAUTHORIZED } from "../../utils/constants.js";
import logInValidator from "./helpers/logInValidator.js";
import { AppError } from "../../utils/AppError.js";

const expireDate = new Date(Date.now() + 3600000);

export const signUp = async (req, res, next) => {
  try {
    signUpValidator({ bodyParams: req.body });

    const { username, email, password } = req.body;

    const hashedPassword = await bcryptjs.hashSync(password, 10);

    const user = new User({
      username,
      email,
      password: hashedPassword,
      isUser: true,
    });

    await user.save();

    res.status(OK).json({ success: true, message: "User added successfully." });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  // const refreshToken = req.cookies.refresh_token;

  if (!req.headers.authorization) {
    return next(errorHandler(403, "bad request no header provided"));
  }

  const refreshToken = req.headers.authorization.split(" ")[1].split(",")[0];
  const accessToken = req.headers.authorization.split(" ")[1].split(",")[1];

  console.log(refreshToken);
  console.log(accessToken);

  if (!refreshToken) {
    // res.clearCookie("access_token", "refresh_token");
    return next(errorHandler(401, "You are not authenticated"));
  }

  try {
    const decoded = Jwt.verify(refreshToken, process.env.REFRESH_TOKEN);
    const user = await User.findById(decoded.id);

    if (!user) return next(errorHandler(403, "Invalid refresh token"));
    if (user.refreshToken !== refreshToken) {
      // res.clearCookie("access_token", "refresh_token");
      return next(errorHandler(403, "Invalid refresh token"));
    }

    const newAccessToken = Jwt.sign(
      { id: user._id },
      process.env.ACCESS_TOKEN,
      { expiresIn: "15m" },
    );
    const newRefreshToken = Jwt.sign(
      { id: user._id },
      process.env.REFRESH_TOKEN,
      { expiresIn: "7d" },
    );

    // Update the refresh token in the database for the user
    await User.updateOne({ _id: user._id }, { refreshToken: newRefreshToken });

    res
      .cookie("access_token", newAccessToken, {
        httpOnly: true,
        maxAge: 900000,
        sameSite: "None",
        secure: true,
        domain: "rent-a-ride-two.vercel.app",
      }) // 15 minutes
      .cookie("refresh_token", newRefreshToken, {
        httpOnly: true,
        maxAge: 604800000,
        sameSite: "None",
        secure: true,
        domain: "rent-a-ride-two.vercel.app",
      }) // 7 days
      .status(200)
      .json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (error) {
    next(errorHandler(500, "error in refreshToken controller in server"));
  }
};

export const signIn = async (req, res, next) => {
  try {
    logInValidator({ credentials: req.body });

    const { email, password } = req.body;

    let user = await User.findOne({ email }, { password: 1 });
    if (!user) {
      throw new AppError("Invalid credentials.", NOT_FOUND);
    }

    const isValidPassword = bcryptjs.compareSync(password, user.password);
    if (!isValidPassword) {
      throw new AppError("Invalid credentials", UNAUTHORIZED);
    }

    const accessToken = jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN, {
      expiresIn: "15m",
    });
    const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN, {
      expiresIn: "7d",
    });

    await User.findByIdAndUpdate(
      { _id: user._id },
      { refreshToken },
      { new: true },
    );

    // const updatedData = await User.findByIdAndUpdate(
    //   { _id: user._id },
    //   { refreshToken },
    //   { new: true }
    // ); //store the refresh token in db

    // //separating password from the updatedData
    // const { password: hashedPassword, isAdmin, ...rest } = updatedData._doc;

    // //not sending users hashed password to frontend
    // const responsePayload = {
    //   refreshToken: refreshToken,
    //   accessToken,
    //   isAdmin,
    //   ...rest,
    // };

    // req.user = {
    //   ...rest,
    //   isAdmin: user.isAdmin,
    //   isUser: user.isUser,
    // };

    // ATTENTION cookie is not getting sent to postman
    res.cookie("access_token", accessToken, {
      expires: expireDate,
      // httpOnly: true,
      // maxAge: 900000,
      // sameSite: "None",
      // secure: true,
      // domain: "rent-a-ride-two.vercel.app", // ATTENTION
    });
    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      // maxAge: 604800000,
      // sameSite: "None",
      // secure: true,
      // domain: "rent-a-ride-two.vercel.app", // ATTENTION
    });

    user = await User.findOne({ email });

    res.status(OK).json({
      success: true,
      message: "User logged in successfully.",
      accessToken: user.accessToken,
      refreshToken: user.refreshToken,
      isAdmin: user.isAdmin,
      isUser: user.isUser,
    });

    next();
  } catch (error) {
    next(error);
  }
};

export const google = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email }).lean();
    if (user && !user.isUser) {
      return next(errorHandler(409, "email already in use as a vendor"));
    }
    if (user) {
      const { password: hashedPassword, ...rest } = user;
      const token = Jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN);

      res
        .cookie("access_token", token, {
          httpOnly: true,
          expires: expireDate,
          SameSite: "None",
          Domain: ".vercel.app",
        })
        .status(200)
        .json(rest);
    } else {
      const generatedPassword =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8); //we are generating a random password since there is no password in result
      const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);
      const newUser = new User({
        profilePicture: req.body.photo,
        password: hashedPassword,
        username:
          req.body.name.split(" ").join("").toLowerCase() +
          Math.random().toString(36).slice(-8) +
          Math.random().toString(36).slice(-8),
        email: req.body.email,
        isUser: true,
        //we cannot set username to req.body.name because other user may also have same name so we generate a random value and concat it to name
        //36 in toString(36) means random value from 0-9 and a-z
      });
      const savedUser = await newUser.save();
      const userObject = savedUser.toObject();

      const token = Jwt.sign({ id: newUser._id }, process.env.ACCESS_TOKEN);
      const { password: hashedPassword2, ...rest } = userObject;
      res
        .cookie("access_token", token, {
          httpOnly: true,
          expires: expireDate,
          sameSite: "None",
          secure: true,
          domain: ".vercel.app",
        })
        .status(200)
        .json(rest);
    }
  } catch (error) {
    next(error);
  }
};
