const expressSwagger = require("express-swagger-generator");

const swaggerConfig = (app) => {
  const PORT = process.env.PORT || 4000;

  const options = {
    swaggerDefinition: {
      info: {
        description: "API Documentation",
        title: "Basecamp-Alpine-Art",
        version: "1.0.0",
      },
      host: `localhost:${PORT}`,
      basePath: "/api/v1",
      produces: ["application/json"],
      schemes: ["http", "https"],
    },
    basedir: require("path").join(__dirname, "../../.."),
    files: ["./src/v1/routes/**/*.js"],
  };

  expressSwagger(app)(options);
};

module.exports = swaggerConfig;
