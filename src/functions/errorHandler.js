module.exports = {
  reqErrors(error, callback) {
    if (error.code == 11000) {
      return callback?.status(500)?.json({
        code: 11,
        message: 'campo indisponivel',
        campo: error.keyValue,
      });
    } else {
      return callback
        .status(500)
        .json({ message: 'ocorreu um erro inesperado', error: error });
    }
  },

  normalErrors(error, callback) {
    callback(500, error);
  },
};
// used for handling errors
