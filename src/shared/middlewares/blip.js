export default function BlipMiddleware(req, res, next) {
  const IPWhiteList = process.env.IP_WHITE_LIST;

  if (!IPWhiteList.includes(req.ip)) {
    req.errorCode = 403;
    throw new Error('IP Not allowed');
  }

  next();
}
