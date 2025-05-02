const handleGlobalError = (err, req, res, next) => {
  err.status = req.status || "Error";

  return res.status(req.statusCode || 500).json({
    status: err.status,
    message: err.message,
  });
};

export default handleGlobalError;
