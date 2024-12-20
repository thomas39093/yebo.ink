const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Store games in memory
const games = {};

io.on('connection', (socket) => {
    console.log('A user connected');

    // Join a game
    socket.on('joinGame', (gameId) => {
        if (!games[gameId]) {
            games[gameId] = { board: Array(9).fill(null), players: [] };
        }
        const game = games[gameId];
        if (game.players.length < 2) {
            game.players.push(socket.id);
            socket.join(gameId);
            io.to(gameId).emit('updateGame', game);
        }
    });

    // Make a move
    socket.on('makeMove', ({ gameId, index }) => {
        const game = games[gameId];
        if (game) {
            game.board[index] = socket.id;
            io.to(gameId).emit('updateGame', game);
        }
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

server.listen(3000, () => {
    console.log('Backend is running on port 3000');
});
