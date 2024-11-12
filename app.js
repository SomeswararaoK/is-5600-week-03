const express = require('express');
const EventEmitter = require('events');

const path = require('path');
const port = process.env.PORT || 3000;
const chatEmitter = new EventEmitter();
const app = express();
app.use(express.static(__dirname + '/public'));

app.get('/', chatApp);
app.get('/json', respondJson);
app.get('/echo', respondEcho);
app.get('/chat', respondChat);
app.get('/sse', respondSSE);

/*
const server = http.createServer(function(request, response) {
  if (request.url === '/') return respondText(request, response);
  if (request.url === '/json') return respondJson(request, response);
  if (request.url.match(/^\/echo/)) return respondEcho(request, response);
  respondNotFound(request, response);
});
*/
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

function respondText(req, res) {
  res.setHeader('Content-Type', 'text/plain');
  res.end('hi');
}

function respondJson(req, res) {
  res.json({
    text: 'hi',
    numbers: [1, 2, 3]
  })
}

function respondNotFound(req, res) {
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not found');
}

function respondEcho(req, res) {
  const { input = '' } = req.query;
  res.json({
    normal: input,
    shouty: input.toUpperCase(),
    charCount: input.length,
    backwards: input.split('').reverse().join(''),
  });
}

function chatApp(req, res) {
  res.sendFile(path.join(__dirname, '/chat.html'));
}

function respondChat(req, res) {
  const { message } = req.query;
  console.log({ message });
  chatEmitter.emit('message', message);
  res.end();
}

function respondSSE(req, res) {
  res.writeHead(200, {
    'Content-Type' : 'text/event-stream',
    'Connection': 'Keep-alive',
  });
  const onMessage = message => res.write(`data: ${message}\n\n`);
  chatEmitter.on('message', onMessage);
  res.on('close', () => {
    chatEmitter.off('message',onMessage);
  })
}