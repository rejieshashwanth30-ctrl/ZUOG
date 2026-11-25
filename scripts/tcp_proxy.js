const net = require('net');
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const server = net.createServer((clientSocket) => {
  dns.resolve4('ep-dry-firefly-bdsq972j-pooler.c-8.us-east-2.aws.neon.tech', (err, addresses) => {
    if (err || !addresses.length) return clientSocket.destroy();
    const serverSocket = net.connect(5432, addresses[0], () => {
      clientSocket.pipe(serverSocket);
      serverSocket.pipe(clientSocket);
    });
    serverSocket.on('error', () => clientSocket.destroy());
    clientSocket.on('error', () => serverSocket.destroy());
  });
});

server.listen(5433, '127.0.0.1', () => {
  console.log('Proxy listening on 127.0.0.1:5433');
});
