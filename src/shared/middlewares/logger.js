import fetch from 'node-fetch';

export default function LoggerMiddleware(req, res, next) {
  const oldSend = res.send;

  function serializeAndSendToLogger(payload) {
    if (
      !['staging', 'production'].includes(process.env.NODE_ENVIROMENT)
    ) {
      console.info('Logger middleware not added');
      return;
    }

    let parsedBody = {};

    try {
      parsedBody = JSON.parse(payload.body);
    } catch (err) {
      parsedBody = payload.body;
    }

    const parsed = {
      request: {
        ip: req.ip,
        path: req.originalUrl,
        method: req.method,
        headers: req.headers,
        body: req.body,
      },
      response: {
        status: payload.status ?? res.statusCode,
        body: parsedBody,
      },
    };

    fetch(
      'https://node-spreadsheets.vercel.app/api/sheets',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          user: process.env.LOGGER_USER,
          pass: process.env.LOGGER_PASS,
        },
        body: JSON.stringify(parsed),
      },
    );
  }

  res.send = (body) => {
    serializeAndSendToLogger({ res, body });

    res.send = oldSend;
    return res.send(body);
  };

  next();
}
