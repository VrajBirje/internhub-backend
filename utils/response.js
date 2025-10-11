const successResponse = (res, message, data = null, statusCode = 200) => {
    res.status(statusCode).json({
        success: true,
        message,
        data
    });
};

const errorResponse = (res, message, statusCode = 400) => {
    res.status(statusCode).json({
        success: false,
        error: message
    });
};

module.exports = {
    successResponse,
    errorResponse
};