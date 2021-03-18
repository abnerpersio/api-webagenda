module.exports = (req, res, next) => {
  const { rawHeaders, httpVersion, method, socket, url, body } = req;
  const { remoteAddress, remoteFamily } = socket;

  console.log(
    JSON.stringify({
      timestamp: Date.now(),
      rawHeaders,
      httpVersion,
      method,
      remoteAddress,
      remoteFamily,
      url,
      body,
    })
  );

  next();
};
