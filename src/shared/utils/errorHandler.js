import * as Sentry from '@sentry/node';

const errorsData = [
  {
    statusCode: 400,
    message: 'Requisição inválida.',
  },
  {
    statusCode: 401,
    message: 'Não autorizado',
  },
  {
    statusCode: 403,
    message: 'Sem permissão',
  },
];

export default function ErrorHandler(error, req, res, next) {
  if (error.code === 11000) {
    res.status(500).json({
      code: 11,
      message: 'campo indisponivel',
      campo: error.keyValue,
    });

    return;
  }

  const errorData = errorsData.find(
    (errorObj) => errorObj.statusCode === req.errorCode,
  );

  if (!errorData) {
    console.log(error);
    Sentry.captureException(error);
  }

  res.status(errorData?.statusCode || 500).json({
    success: false,
    message: errorData?.message ? `${errorData.message} ${error.message}` : error.message,
    sentry_code: errorData ? null : Sentry.lastEventId(),
  });
}
