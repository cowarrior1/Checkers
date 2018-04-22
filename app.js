var express = require("express");
var app = express();
var http =  exports.http = require("http").Server(app);
var io = require("socket.io")(http);
var path = require("path");
var ConnectionManager = exports.ConnectionManager = {
	connections : [],
	clientIds : [],
	waitingClient : {
		id : -1,
		socket : null
	}
};
var GameStatus = {
	inSession : false,
	currentPlayerTurn : -1,
	gameBoard : null,
	disconnectHappened : false,
	playerQuit : false,
	playersOnMainPage : false,
};
var	PlayingClients = {
	player1 : {
		id : -1,
		socket : null
	},
	player2 : {
		id : -1,
		socket : null
	},
};

var dir = path.join(__dirname, "./Frontend/assets"); //serving static files
app.use(express.static(dir));

app.get("/", function (req, res) {
	res.sendFile(path.join(__dirname, "./Frontend/", "StartScreen.html"));
});

app.get("/Waiting", function (req, res){
	res.sendFile(path.join(__dirname, "./Frontend/", "WaitingScreen.html"));
});

app.get("/Main", function (req, res){
	res.sendFile(path.join(__dirname, "./Frontend/", "index.html"));
});

io.on("connection", function(socket){
	ConnectionManager.connections.push(socket);
	//console.log("Number of Connections: %s", ConnectionManager.connections.length);
	socket.id = Math.random();//id to sockets
	socket.number= "" + Math.floor(10 * Math.random());

	socket.on("getGameStatus", function() {
		GameStatus.playersOnMainPage = true;
		socket.emit("receiveGameStatus", GameStatus);
	});

	socket.on("acceptMove", function(data) {
		// if its this players turn
		if (GameStatus.currentPlayerTurn == data.clientId) {
			// update the gameboard
			GameStatus.gameBoard = data.gameBoard;
			// toggle the players turn and send the new status to the other client
			if (data.clientId == PlayingClients.player1.id) {
				if (!data.noTurnChange) {
					GameStatus.currentPlayerTurn = PlayingClients.player2.id;
				}
				PlayingClients.player2.socket.emit("receiveGameStatus", GameStatus);
			} else {
				if (!data.noTurnChange) {
					GameStatus.currentPlayerTurn = PlayingClients.player1.id;
				}
				PlayingClients.player1.socket.emit("receiveGameStatus", GameStatus);
			}
		}
	});

	socket.on("identify", function(clientId){
		socket.clientId = clientId;
		if (ConnectionManager.waitingClient.id == clientId && GameStatus.inSession) {
			socket.emit("OpponentFound", {ref : "./Main"});
			ConnectionManager.waitingClient.id = -1;
		} else if (ConnectionManager.waitingClient.id == clientId) {
			ConnectionManager.waitingClient.socket = socket;
		} else if (GameStatus.inSession && ConnectionManager.waitingClient.id == -1) {
			// Game has started update players sockets
			if (PlayingClients.player1.id == clientId) {
				PlayingClients.player1.socket = socket;
			} else if (PlayingClients.player2.id == clientId) {
				PlayingClients.player2.socket = socket;
			}
		}
	});

	socket.on("startGame", function(){
		if (!GameStatus.inSession) {
			socket.clientId = ConnectionManager.clientIds.length;
			ConnectionManager.clientIds.push(ConnectionManager.clientIds.length);
			if (ConnectionManager.waitingClient.id == -1) {
				//console.log("One player waiting");
				PlayingClients.player1.id = socket.clientId;
				ConnectionManager.waitingClient.id = socket.clientId;
				var data = {
					ref : "./Waiting",
					clientId : socket.clientId
				};
				socket.emit("button", data);
			} else if (ConnectionManager.waitingClient.id != socket.clientId){
				//console.log("Two players ready");
				PlayingClients.player2.id = socket.clientId;
				data = {
					ref : "./Main",
					clientId : socket.clientId
				};
				socket.emit("button", data);
				if (ConnectionManager.waitingClient.socket != null) {
					ConnectionManager.waitingClient.socket.emit("OpponentFound", {ref : "./Main"});
					ConnectionManager.waitingClient.id = -1;
				}
				// set first players turn randomly
				if (Math.floor(Math.random() * Math.floor(2)) == 0) {
					GameStatus.currentPlayerTurn = PlayingClients.player1.id;
					//console.log(GameStatus.currentPlayerTurn);
				} else {
					GameStatus.currentPlayerTurn = PlayingClients.player2.id;
					//console.log(GameStatus.currentPlayerTurn);
				}
				GameStatus.inSession = true;
			}
		}
	});

	socket.on("quitGame", function(clientId){
		//console.log("client quit game");
		GameStatus.playerQuit = true;

		if (clientId == PlayingClients.player1.id) {
			PlayingClients.player2.socket.emit("receiveGameStatus", GameStatus);
		} else if (clientId == PlayingClients.player2.id) {
			PlayingClients.player1.socket.emit("receiveGameStatus", GameStatus);
		}
	});

	socket.on("disconnect", function(){
		ConnectionManager.connections.splice(ConnectionManager.connections.indexOf(socket), 1);
		//console.log("Disconnected Connections: %s", ConnectionManager.connections.length);

		if (GameStatus.inSession && GameStatus.playersOnMainPage) {
			//console.log("Player disconnected while in game");
			//console.log(socket.ClientId);
			GameStatus.disconnectHappened = true;
			if (socket.clientId == PlayingClients.player1.id && PlayingClients.player2.socket != null) {
				//console.log("Player 2 wins as player 1 disconnected");
				PlayingClients.player2.socket.emit("receiveGameStatus", GameStatus);
			} else if (socket.clientId == PlayingClients.player2.id && PlayingClients.player1.socket != null) {
				//console.log("Player 1 wins as player 2 disconnected");
				PlayingClients.player1.socket.emit("receiveGameStatus", GameStatus);
			}
			GameStatus.inSession = false;
			GameStatus.currentPlayerTurn = -1;
			GameStatus.playersOnMainPage = false;
			GameStatus.playerQuit = false;
			GameStatus.gameBoard = null;
			PlayingClients.player1.id = -1;
			PlayingClients.player1.socket = null;
			PlayingClients.player2.id = -1;
			PlayingClients.player2.socket = null;
			ConnectionManager.waitingClient.id = -1;
			ConnectionManager.waitingClient.socket = null;
			GameStatus.disconnectHappened = false;
		}

	});
});

exports.close = function(callback){
	this.http.close(callback);
};



http.listen(8080, function(){
	console.log("listening on 8080");
});
