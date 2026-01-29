export const asyncHandler = (requestedFunction) => {
  return (req, res, next) => {
    Promise.resolve(requestedFunction(req, res, next)).catch((error) =>
      next(error),
    );
  };
};
