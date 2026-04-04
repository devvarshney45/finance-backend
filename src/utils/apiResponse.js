// src/utils/apiResponse.js
// Utility functions to send consistent API responses across all controllers
// Instead of writing res.status(200).json({...}) every time, we use these helpers

const sendSuccess = (res, data = {}, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,   // Frontend can check this boolean to know if request worked
    message,
    data,
  });
};

const sendError = (res, message = 'Error', statusCode = 400, errors = null) => {
  const response = { success: false, message };
  if (errors) response.errors = errors; // Include validation errors if any
  return res.status(statusCode).json(response);
};

module.exports = { sendSuccess, sendError };