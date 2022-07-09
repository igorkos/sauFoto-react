import {
  logger,
  consoleTransport,
  fileAsyncTransport,
} from "react-native-logs";

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
};

const Log = logger.createLogger(config);

export { Log };
