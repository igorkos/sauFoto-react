import { self } from 'react-native-threads';
import './config';
import {Log} from "../hooks/log";

let count = 0;

self.onmessage = (message: any) => {
    Log.debug(`THREAD: got message ${message}`);

    count++;

    self.postMessage(`Message #${count} from worker thread!`);
}
