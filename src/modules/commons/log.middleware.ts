export const logMiddleware = (req, res, next) => {
  const startTime = Date.now();
  console.log(`logMiddleware path=${req.url}`);
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    console.log(`logMiddleware path=${req.url} - ${duration}ms`);
  });
  next();
};