const errorsData = [
  {
    statusCode: 400,
    message: 'Requisição inválida. tente novamente',
  },
  {
    statusCode: 403,
    message: 'Não autorizado',
  },
];

export const errorHandler = (error, req, res) => {
  console.log('erro', error);

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

  res.status(errorData?.statusCode || 500).json({
    success: false,
    debugData: errorData?.message ? `${errorData.message} ${error.message}` : error.message,
  });
};
