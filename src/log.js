import path from 'path';
import fs from 'fs';

var LOG_PATH = path.join(__dirname, '../log.txt');

export default function (msg) {
    console.log(msg);
    fs.writeSync(LOG_PATH, new Date().toLocaleString() + ': ' + msg + '\r\n', 'utf-8');
}
