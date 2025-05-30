import app from "./src/app";
import config from "./src/config/config";
import connectDB from "./src/config/db";

const startServer = () => {
  const APP_PORT = config.APP_PORT;

  connectDB()
    .then(() => {
      app.listen(APP_PORT || 8000, () => {
        console.log(`Server is running at port : ${APP_PORT}`);
      });
    })
    .catch((err) => {
      console.log("MONGODB connection failed !!!", err);
    });

};

startServer();
