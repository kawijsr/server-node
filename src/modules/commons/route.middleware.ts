export const routeMiddleware = (req, res, next) => {
  console.log(`routeMiddleware path=${req.path}`);
  next();
};