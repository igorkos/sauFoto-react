import {
  logger,
  consoleTransport,
  fileAsyncTransport,
} from "react-native-logs";

const InteractionManager = require("react-native").InteractionManager;

const config = {
  transport: __DEV__ ? consoleTransport : fileAsyncTransport,
  severity: __DEV__ ? "debug" : "error",
  transportOptions: {
    colors: {
      info: "blueBright",
      warn: "yellowBright",
      error: "redBright",
    },
  },
  async: true,
  asyncFunc: InteractionManager.runAfterInteractions,
};

const Log = logger.createLogger(config);

export { Log };
