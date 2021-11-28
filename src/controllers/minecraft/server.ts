import { time } from '@discordjs/builders';
import { spawn } from 'child_process';
import readline from 'readline';

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

mc_server.stdout.setEncoding('utf-8');
mc_server.stdout.on('data', (raw: string) => {
  for (let line of raw.split('\n')) {
    if (line.substring(-1) === '\r') line.slice(0, -1);
    if (line.length === 0) break;
    const data: Data = _parse_line(line);
    console.log(data);
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

const ctrl = readline.createInterface(process.stdin);

ctrl.on('line', (line) => {
  mc_server.stdin.write(line + '\n');
});

export default mc_server;