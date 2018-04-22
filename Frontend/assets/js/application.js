//Global Variables
//thisPlayer and currentPlayerTurn needs to be synced with the other player device
var thisPlayer = "light";  //Always remains same of a device and a session
var currentPlayerTurn= "dark"; //Whose turn is it : can change between light and dark
var otherPlayer="dark";
var selected=false;

// Server communication --------------------
var socket = io();
var GameStatus;
var firstGameStatus = true;
	
socket.on("connect", function () {
	if (window.sessionStorage.clientId != null) {
		socket.emit("identify", window.sessionStorage.clientId);
	} else {
		//!-- console.log("Error: can't communicate with server without clientId");
	}
});

socket.on("receiveGameStatus", function(data){
	GameStatus = data;

	if (GameStatus.disconnectHappened) {
		//alert(thisPlayer + ' wins due to disconnection');
		window.location = "../../";
	}

	if (GameStatus.playerQuit) {
		//alert(thisPlayer + ' wins to due the other playing quitting');
		window.location = "../../";
	}

	// update the board
	if (data.gameBoard != null) {
		$(".checkerBoard").html(data.gameBoard);
		updateScore();
		gameOver();
		cellClicked();
	}
	if (GameStatus.currentPlayerTurn == window.sessionStorage.clientId) {
		// its our turn!
		currentPlayerTurn = thisPlayer;
	} else {
		currentPlayerTurn = otherPlayer;
	}
	// logic for if we are light or dark player
	if (firstGameStatus) {
		firstGameStatus = false;
		// if its not our turn first set us to dark player
		// first player will be light player so update turn also
		if (currentPlayerTurn == otherPlayer) {
			otherPlayer = thisPlayer;
			thisPlayer = currentPlayerTurn;
			currentPlayerTurn = otherPlayer;
		}
	}
	displayCurrentPlayer();
});

// End server communication ----------------

function quitGame(){
	socket.emit("quitGame", window.sessionStorage.clientId);
	window.location = "../../";
}

$(window).ready(function() {
	//get initial game status
	firstGameStatus = true;
	socket.emit("getGameStatus");
	
	//Setup the board and choose the starting color
	setup();

	cellClicked();

	document.getElementById("quitGame").onclick = quitGame;
	gameOver();
});

//@Chetan K Parakh
function displayCurrentPlayer(){
	var toDisplay;
	thisPlayer==currentPlayerTurn?toDisplay="Your Turn":toDisplay="Wait for your turn";
	if(isGameOver()==null){
		($(".displayPlayer").html(toDisplay));
	}
}

function cellClicked(){
	$(".cell").on("click", function () {
		if(currentPlayerTurn == thisPlayer){ //making sure its thisPlayer's turn
			if($(this).find(".piece").length>0){ //If the cell has a piece
				if($(this).find(".piece."+thisPlayer).length>0){ //If the piece belongs to thisPlayer
					pieceClicked($(this).children()); //pieceClicked function called, passing the <div class="piece thisPlayer"> object
				}
			}
			else {
				//If the cell does not have a piece

				//If a piece is already selected and If this cell is a possible move spot for the selected piece
				if(selected && ($(this).children("div.possibleMoveLocation").length>0)){
					//-- Make move?
					makeMoveSteps($(this));
				}
			}
		}
		else {
			//Not this player turn. Do nothing or just show a message saying not your turn
		}
		displayCurrentPlayer();
	});
}

//makeMove
function makeMoveSteps(moveTo){
	var selectedPiece = $(".piece.selected");

	var isJump = removeMiddlePieceIfJump(moveTo, selectedPiece);

	makeMove(moveTo, selectedPiece);

	makeKing(moveTo);

	var noTurnChange = multipleChances(moveTo, isJump);
	
	var board = $(".checkerBoard").html();
	
	socket.emit("acceptMove", {clientId: window.sessionStorage.clientId, gameBoard : board, noTurnChange: noTurnChange});

	updateScore();
	
	gameOver();
}

function gameOver(){
	var GameOver = isGameOver();
	var result ="Lose";
	var bootStrapClass="danger";
	//console.log("inside game over");
	if(GameOver!=null){
		if(thisPlayer==GameOver){
			result="Win";
			bootStrapClass="success";
		}
		$(".displayPlayer").html(
			"<div class='alert alert-"+bootStrapClass+ " alert-dismissible' id='myAlert'><a href='#' class='close'>&times;</a>You "+ result+"</div>"	
		);
		$(".displayPlayer").removeClass("displayPlayer");
	}
}

function updateScore(){
	$(".playerLightScore").html(12-($(".dark").length)); //Player Light score = number of dark pieces, player light captured
	$(".playerDarkScore").html(12-($(".light").length));
}

function isGameOver(){
	//Condition 1 : No pieces of a player remaining.
	if(($(".dark").length)==0){
		return "light";
	}
	else if(($(".light").length)==0){
		return "dark";
	}

	//Condition 2 : Current player cannot make any more move.
	if(!anyPossibleMove(thisPlayer)){
		return otherPlayer;
	}
	return null;
}

function anyPossibleMove(player){
	var flag=false;
	$("."+player).each(function (){
		if(!(possibleMoves($(this).parent()).length==0)){
			flag= true;
		}
	});
	return flag;
}

function multipleChances(moveTo, isJump){
	if(!(isJump && possibleJumps(moveTo).length!=0)){
		currentPlayerTurn = otherPlayer;
		return false;
	}else{        
		pieceClicked(moveTo.children());
		return true;
	}
}

function removeMiddlePieceIfJump(moveTo, selectedPiece){
	var moveFrom = selectedPiece.parent();

	var X0 = parseInt(moveFrom.attr("row"));
	var Y0 = parseInt(moveFrom.attr("col"));

	var X1 = parseInt(moveTo.attr("row"));
	var Y1 = parseInt(moveTo.attr("col"));

	if(Math.abs(X0-X1) == 2){ //If Jump
		var middleX = ((X0+X1)/2);
		var middleY = ((Y0+Y1)/2);
		var cellWithPieceToRemove = $("td[row='"+middleX+"'][col='"+middleY+"']");
		cellWithPieceToRemove.children().remove();
		return true;
	}
	return false;
}

function makeMove(moveTo, selectedPiece){
	removeAllHighlightedBox();
	moveTo.append(selectedPiece);
	removeSelectedPiece();
	selected=false;
}

function makeKing(moveTo){
	var child = moveTo.children("div");
	if((moveTo.attr("row")==7 || moveTo.attr("row")==0) && !child.hasClass("king")){
		child.addClass("king");
	}
}

function pieceClicked(clickedPiece){
	if (clickedPiece.hasClass("selected")) {
		removeSelectedPiece();
		removeAllHighlightedBox();
	}
	else {
		removeSelectedPiece(); //Unselect the selected piece first
		removeAllHighlightedBox();
		clickedPiece.addClass("selected"); //highlight the selected piece
		selected=true;
		var possibleMovesToHighlight = possibleMoves(clickedPiece.parent()); //get all the possible moves and highlight
		highLightTheseBoxes(possibleMovesToHighlight);
	}
}

function possibleMoves(clickedCell){
	var allPossibleMoves =[];
	allPossibleMoves = possibleJumps(clickedCell);
	if(allPossibleMoves.length==0){
		allPossibleMoves=possibleSlides(clickedCell);
	}
	return allPossibleMoves;
}

function possibleJumps(clickedCell){
	var toCheck = boxToCheck(clickedCell.attr("row"), clickedCell.attr("col"), "Jumps");
	var allPossibleJumps = [];
	var Xloc = parseInt(clickedCell.attr("row"));
	var Yloc = parseInt(clickedCell.attr("col"));

	for(var i=0; i<toCheck.length; i++){
		var X = parseInt(toCheck[i].X0);
		var Y = parseInt(toCheck[i].Y0);
		var eachBoxForHiglighting = $("td[row='"+X+"'][col='"+Y+"']");
		if(eachBoxForHiglighting.length!=0 && eachBoxForHiglighting.children("div.piece").length==0){
			var middleX = ((X+Xloc)/2);
			var middleY = ((Y+Yloc)/2);
			var middleBoxToCheck =$("td[row='"+middleX+"'][col='"+middleY+"']");
			if(middleBoxToCheck.children("."+otherPlayer).length!=0){
				allPossibleJumps.push({Row:X, Col:Y});
			}
		}
	}
	return allPossibleJumps;
}

function possibleSlides(clickedCell){
	var toCheck = boxToCheck(clickedCell.attr("row"), clickedCell.attr("col"), "Slides");
	var allPossibleSlides = [];

	for(var i=0; i<toCheck.length; i++){
		var X = toCheck[i].X0;
		var Y= toCheck[i].Y0;
		var eachBoxForHiglighting =$("td[row='"+X+"'][col='"+Y+"']");
		if(eachBoxForHiglighting.length!=0 && eachBoxForHiglighting.children("div.piece").length==0){
			allPossibleSlides.push({Row:X, Col:Y});
		}
	}
	return allPossibleSlides;
}

function boxToCheck(Xloc, Yloc, moveType){
	var boxContent =$("td[row='"+Xloc+"'][col='"+Yloc+"']");
	var isKing = (boxContent.children("div.piece.king").length!=0);   //if the box contains king set isKing to true
	var possibleBoxes =[];
	var counter;
	//If possibleSlides called this function
	(moveType=="Slides")?counter=1:counter=2;

	var Xs;
	if(isKing){ //If King same for both light and dark
		Xs = [(parseInt(Xloc)+counter), (parseInt(Xloc)-counter)];
	}else if(!isKing){ //If not king
		if(thisPlayer=="light"){ //If is it light piece
			Xs = [parseInt(Xloc)+counter];
		}else if(thisPlayer=="dark"){ //If it is dark piece
			Xs = [parseInt(Xloc)-counter];
		}
	}

	var Ys =[(parseInt(Yloc)+counter), (parseInt(Yloc)-counter)];
	for(var i=0; i<Xs.length; i++){
		for(var j=0; j<Ys.length; j++){
			if(Xs[i]>=0 && Xs[i]<=7 && Ys[j]>=0 && Ys[j]<=7){
				possibleBoxes.push({X0:Xs[i], Y0:Ys[j]});
			}
		}
	}
    
	return possibleBoxes;
}

//Takes an array that contains a json obj with Row and Col that needs to be highlighted. Eg: [{Row:3, Col:3},{Row:3, Col:5}]
function highLightTheseBoxes(boxToHighlight){
	for(var i=0; i < boxToHighlight.length; i++){
		var indOfBoxToHighlight = boxToHighlight[i];
		var highlightThis =$("td[row='"+indOfBoxToHighlight.Row+"'][col='"+indOfBoxToHighlight.Col+"']");
		highlightThis.append("<div class='possibleMoveLocation'></div>");
	}
}

function removeSelectedPiece(){
	$(".selected").removeClass("selected");
	selected=false;
}

function removeAllHighlightedBox(){
	$( ".possibleMoveLocation" ).remove();
}


//@Saugat Sthapit
function setup(){
	//Display Player
	displayCurrentPlayer();

	//Lay down the checkerboard
	for (var i=0;i<8;i++){
		$(".checkerBoard").append("<tr row='"+i+"'></tr>");
		for (var j=0;j<8;j++){
			var color = "black";
			if ((i+j)%2 == 0){color = "white";}
			$(".checkerBoard tr[row="+i+"]").append("<td class='cell "+color+"' row='"+i+"' col='"+j+"'></td>");
		}
	}
	//Create the pieces
	for (i=0;i<4;i++){
		for (j=0;j<3;j++){
			$(".checkerBoard [col="+(i*2+((j+1)%2))+"][row="+j+"]").append("<div class='piece light'></div>");
			$(".checkerBoard [col="+(i*2+(j%2))+"][row="+(7-j)+"]").append("<div class='piece dark'></div>");
		}
	}
}
