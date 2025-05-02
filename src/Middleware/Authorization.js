import { userModel } from "../models/user.model.js";
import { generateToken, verifyToken } from "../units/tokenFunctions.js";
import jwt, { decode } from "jsonwebtoken";

// authorization
export const isAdmin = (req, res, next) => {
  let { authorization } = req.headers;
  if (!authorization) {
    return res.status(404).json({ message: "invalid token" });
  }
  try {
    jwt.verify(authorization, "STITCH", async (err, decoded) => {
      if (err) {
        return res.status(400).json({ message: "you are not authorized" });
      }
      if (decoded) {
        let founded = await userModel.findById(decoded._id);
        if (!founded) {
          return res.status(400).json({ message: "you are not authorized" });
        }
        if (decoded.role !== "admin") {
          return res.status(401).json({ message: "you are not authorized" });
        }
        next();
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "internal server error" });
  }
};

export const isAuth = () => {
  return async (req, res, next) => {
    try {
      const { authorization } = req.headers;
      if (!authorization) {
        return next(new Error("Please login first", { cause: 400 }));
      }

      // if (!authorization.startsWith('ecomm__')) {
      //   return next(new Error('invalid token prefix', { cause: 400 }))
      // }

      const splitedToken = authorization.split(" ")[1];

      try {
        const decodedData = verifyToken({
          token: splitedToken,
          signature: "STITCH", // ! process.env.SIGN_IN_TOKEN_SECRET
        });
        const findUser = await userModel.findById(
          decodedData._id,
          "email userName role"
        );
        if (!findUser) {
          return next(new Error("Please SignUp", { cause: 400 }));
        }
        req.authUser = findUser;
        next();
      } catch (error) {
        // token  => search in db
        if (error == "TokenExpiredError: jwt expired") {
          // refresh token
          const user = await userModel.findOne({ token: splitedToken });
          if (!user) {
            return next(new Error("Wrong token", { cause: 400 }));
          }
          // generate new token
          const userToken = generateToken({
            payload: {
              email: user.email,
              _id: user._id,
            },
            signature: "STITCH", // ! process.env.SIGN_IN_TOKEN_SECRET
            expiresIn: "1h",
          });

          if (!userToken) {
            return next(
              new Error("token generation fail, payload canot be empty", {
                cause: 400,
              })
            );
          }

          // user.token = userToken
          // await user.save()
          await userModel.findOneAndUpdate(
            { token: splitedToken },
            { token: userToken }
          );
          return res
            .status(200)
            .json({ message: "Token refreshed", userToken });
        }
        return next(new Error("invalid token", { cause: 500 }));
      }
    } catch (error) {
      console.log(error);
      next(new Error("catch error in auth", { cause: 500 }));
    }
  };
};
