import mc from 'minecraft-protocol';

const client = mc.createClient({
  host: "localhost",
  port: 25565,
  username: "SERVER"
});

client.on('chat', (packet) => {
  return;
});