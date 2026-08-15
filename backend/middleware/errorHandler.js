// Centralized error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error("Internal Server Error:", err);

  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  const isProduction = process.env.NODE_ENV === "production";

  res.status(statusCode).json({
    message: err.message || "An unexpected server error occurred",
    ...(isProduction ? {} : { error: err.message, stack: err.stack }),
  });
};

module.exports = errorHandler;
