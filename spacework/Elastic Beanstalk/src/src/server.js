import express from 'express';
import React from 'react';
import { renderToString } from 'react-dom/server';
import App from 'index.js';

const server = express();

server.get('/', (req, res) => {
    const appString = renderToString(<App />);
  
    res.send(template({
      body: appString,
      title: 'Hello World from the server'
    }));
  });
  
  server.listen(8080);