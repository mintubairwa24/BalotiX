const sendResponse = (
  res,
  { statusCode = 200, success = true, message = "", data = {}, meta = {} } = {}
) => {
  return res.status(statusCode).json({
    success,
    message,
    ...data,
    ...meta,
  });
};

export default sendResponse;

