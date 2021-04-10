module.exports = (error, callback) => {
  if (error.code == 11000) {
    callback
      .status(500)
      .json({ code: 11, message: 'campo indisponivel', campo: error.keyValue });
  } else {
    console.log('erro: ', error);
    callback
      .status(500)
      .json({ message: 'ocorreu um erro inesperado', error: error });
  }
};
// used for handling errors
