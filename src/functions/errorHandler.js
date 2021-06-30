module.exports = {
  reqErrors(error, callback) {
    console.log(error);
    if (error.code == 11000) {
      return callback?.status(500)?.json({
        code: 11,
        message: 'campo indisponivel',
        campo: error.keyValue,
      });
    } else {
      return callback
        ?.status(500)
        ?.json({ message: 'ocorreu um erro', error: error });
    }
  },

  normalErrors(error, callback) {
    callback(500, error);
  },
};
// used for handling errors
