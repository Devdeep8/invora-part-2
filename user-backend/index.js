import { createServer } from "http";
import config from "@/src/configs/app.config.js";
import app from "@/src/rest-resources/index.js";

const PORT = config.get("port");
const server = createServer(app);

server.listen(PORT, () => {
  console.log(
    `🚀 ${config.get("app.name")} running on port ${PORT} [${config.get("env")}]`,
  );
});
