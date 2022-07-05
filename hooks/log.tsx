import { logger, mapConsoleTransport } from 'react-native-logs';

const config = {
  levels: {
    debug: 0,
    info: 1,
    warn: 2,
    err: 3,
  },
  transport: mapConsoleTransport,
  transportOptions: {
    mapLevels: {
      debug: "log",
      info: "info",
      warn: "warn",
      err: "error",
    },
  },
};

var log = logger.createLogger(config);

if (__DEV__) {
  log.setSeverity('debug');
} else {
  log.setSeverity('error');
}

export { log };