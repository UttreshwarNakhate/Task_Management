import app from "./src/app";
import config from "./src/config/config";
import connectDB from "./src/config/db";
import logger from "./src/utils/logger";

const startServer = () => {
  const APP_PORT = config.APP_PORT;

  connectDB()
    .then(() => {
      app.listen(APP_PORT || 8000, () => {
        logger.info(`Server is running at port : ${APP_PORT}`);
      });
    })
    .catch((err) => {
      logger.error("MONGODB connection failed !!!", err);
    });

};

startServer();
