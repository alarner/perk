module.exports = {
  {
    paths: {
      controllers: '../controllers',
      emails: '../emails',
      libraries: '../libraries',
      models: '../models',
    },
    features: {
      auth: true,
      email: true,
    },
    transform: {
      libraries(libraries) {

      },
      models(models) {

      }
    }
  }
};
