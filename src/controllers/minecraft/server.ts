import { spawn } from 'child_process';
import { connection_handler, message_handler } from '../discord/minecraft_link';

const server_path: string = '../server';
const server_file: string = 'server.jar';
const min_heap_size: string = '2048M';
const max_heap_size: string = '8192M';

const mc_server = spawn('java', ['-Xmx' + max_heap_size, '-Xms' + min_heap_size, '-jar', './' + server_file, 'nogui'], { cwd: server_path });

interface Data {
  time: Date;
  type: string;
  data: string;
};

function _parse_line(line: string) : Data {
  let tmp = line.split(' ');
  const time_buffer: string[] = tmp[0].slice(1, -1).split(':');
  tmp.shift();
  line = tmp.join(' ');
  tmp = line.split(': ');
  const type_buffer: string = tmp[0].slice(1, -1);
  tmp.shift();
  const data_buffer: string = tmp.join(': ');
  let timestamp: Date = new Date();
  timestamp.setHours(parseInt(time_buffer[0]));
  timestamp.setMinutes(parseInt(time_buffer[1]));
  timestamp.setSeconds(parseInt(time_buffer[2]));
  return {
    time: timestamp,
    type: type_buffer,
    data: data_buffer
  };
}

function _info_handler(data: Data) : void {
  const tmp = data.data.split(' ');
  if (tmp[1] === 'joined' && tmp[2] === 'the' && tmp[3] === 'game') {
    connection_handler(tmp[0], true);
  } else if (tmp[1] === 'left' && tmp[2] === 'the' && tmp[3] === 'game') {
    connection_handler(tmp[0], false);
  } else if (tmp[0].startsWith('<') && tmp[0].endsWith('>')) {
    const username: string = tmp[0].slice(1, -1);
    const message: string[] = tmp;
    message.shift();
    message_handler(username, message.join(' '));
  }
  console.log(data);
}

mc_server.stdout.setEncoding('utf-8');
mc_server.stdout.on('data', (raw: string) => {
  for (let line of raw.split('\n')) {
    if (line.substring(-1) === '\r') line.slice(0, -1);
    if (line.length === 0) break;
    const data: Data = _parse_line(line);
    if (data.type === 'Server thread/INFO') {
      _info_handler(data);
    } else {
      console.log(data);
    }
  }
});

mc_server.stderr.setEncoding('utf-8');
mc_server.stderr.on('data', (data: string) => {
  console.log('!> ', data);
});

mc_server.on('error', (err: Error) => {
  console.log(err);
});

mc_server.on('close', (code) => {
  console.log('Server closed !');
});

export default mc_server;