import { spawn } from 'child_process';
import readline from 'readline';

const server_path: string = '../server';
const server_file: string = 'server.jar';
const min_heap_size: string = '2048M';
const max_heap_size: string = '8192M';

const mc_server = spawn('java', ['-Xmx' + max_heap_size, '-Xms' + min_heap_size, '-jar', './' + server_file, 'nogui'], { cwd: server_path });

mc_server.stdout.setEncoding('utf-8');
mc_server.stdout.on('data', (data) => {
  process.stdout.write(data);
});

mc_server.stderr.setEncoding('utf-8');
mc_server.stderr.on('data', (data) => {
  console.log('!> ', data);
});

mc_server.on('error', (err) => {
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