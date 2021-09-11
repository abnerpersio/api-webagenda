// const whitelist = ['http://localhost:3000'];

export default function CorsMiddleware(req, res, next) {
  // const isOriginWhiteListed = whitelist.find(
  //   (item) => item === req.headers.origin,
  // );

  // if (isOriginWhiteListed) {
  // console.log(req.headers.origin);
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
  res.setHeader('Access-Control-Allow-Methods', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Max-Age', '40');
  // }

  next();
}
