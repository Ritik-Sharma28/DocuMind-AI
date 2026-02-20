export const errorHandler = (err, _req, res, _next) => {
    console.error("❌ ", err.message);
    res.status(err.statusCode || 500).json({
        message: err.message || "Internal Server Error",
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
};
