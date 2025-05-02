import AppError from "../utils/appError.js";
//===========================================

const catchRoutes = (req, res, next) => {
  return next(new AppError(`cannot find ${req.path} on this server`, 404));
};

export default catchRoutes;
