import server from './server';

const mc_server = {
  write: async function(data: string) {
    server.stdin.write(data + '\n');
  }
};

export default mc_server;