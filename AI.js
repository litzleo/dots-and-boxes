

const AI_IDLE_TIME = 100;

function AIsTurn(){//Decides which side the AI should pick as it's move

  let bestScore = Number.NEGATIVE_INFINITY;
  let bestSide = null;

  let remainingSides = 0;

  //the amount of moves into the future the AI will analize is calculated based on how many sides remain empty
  //it's a tradeoff between speed and accuracy
  for(let i=0; i<sides.length; i++){
    if(sides[i].c == COLORS[0])remainingSides++;
  }
  let maxTimeout = floor(0.08037704 + (1672975 - 0.08037704)/(1 + pow((remainingSides/1.508898e-13),0.4008247)));

  //the sides are analized in a random order to make the AI less predictable
  let shuffledSides = shuffle(sides);

  for(let i=0; i<shuffledSides.length; i++){

    //a side is picked, and the game is updated
    let side = shuffledSides[i];

    if(side.c == COLORS[0]){
      let complete = false;
      let prevPlayer = player;
      side.c = COLORS[player];

      for(let j=0;j<side.squares.length;j++){
        let square = side.squares[j];
        if(isSquareComplete(square)){
          complete = true;
          square.c = side.c;
          score[player]++;
          score[0]++;
        }
      }
      if(!complete){
        player++;
        if(player == amountOfPlayers+1)player = 1;
      }

      //a function is called, it assigns a "score" to the side that was choosen
      let n = simulate(maxTimeout, prevPlayer, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY);


      //the side that was picked updated the game, this update is reversed after the "score" has been assigned
      player = prevPlayer;

      side.c = COLORS[0];

      for(let j=0;j<side.squares.length;j++){
        let square = side.squares[j];
        if(square.c != SQUARE_COLOR){
          square.c = SQUARE_COLOR;
          score[player]--;
          score[0]--;
        }
      }

      //if the "score" is better than the current best score both the best score and the best side are updated
      if(n > bestScore){
        bestScore = n;
        bestSide = i;
      }
    }
  }

  //the best side is returned, this is the move the AI has calculated
  return shuffledSides[bestSide];

}

function euristic(currentPlayer){//gives an approximate score based on the state of the game
  let almostComplete = 0;
  for(let i=0; i<squares.length; i++){
    for(let j=0; j<squares[i].length; j++){
      if(countCompleteSides(squares[i][j]) == 3)almostComplete++;
    }
  }
  if(player != currentPlayer)almostComplete *= -1;

  //returns the score of the AI minus the score of everyone else plus
  //the amount of almost complete squares available, which is turned negative if it's not the AI's turn next
  return 2*score[currentPlayer] - score[0] + almostComplete;
}

function simulate(timeout, currentPlayer, alpha, beta){//calculates and returns the "score" of the picked side
  if(score[0] == (gridSize - 1)*(gridSize - 1)){//if the board is full a value based on the final score is returned
    return 2*score[currentPlayer] - score[0];
  }

  if(timeout == 0){//if the AI has analized enough moves into the future an approximate score is calculated and returned
    return euristic(currentPlayer);
  }


  //minimax is a value that the AI maximizes and everyone else minimizes
  let minimax;
  let appropriateSide = null;
  if(player == currentPlayer)minimax = Number.NEGATIVE_INFINITY;
  else minimax = Number.POSITIVE_INFINITY;

  let shuffledSides = shuffle(sides);

  for(let i=0; i<shuffledSides.length; i++){

    //a side is picked and the game is updated
    let side = shuffledSides[i];
    if(side.c == COLORS[0]){
      let complete = false;
      let prevPlayer = player;
      side.c = COLORS[player];

      for(let j=0;j<side.squares.length;j++){
        let square = side.squares[j];
        if(isSquareComplete(square)){
          complete = true;
          square.c = side.c;
          score[player]++;
          score[0]++;
        }
      }
      if(!complete){
        player++;
        if(player == amountOfPlayers+1)player = 1;
      }

      //the score assigning function is recursevely called
      let n = simulate(timeout-1, currentPlayer, alpha, beta);

      //the move previously made is resetted and the state of the game with it
      player = prevPlayer;

      side.c = COLORS[0];

      for(let j=0;j<side.squares.length;j++){
        let square = side.squares[j];
        if(square.c != SQUARE_COLOR){
          square.c = SQUARE_COLOR;
          score[player]--;
          score[0]--;
        }
      }


      //based on the score just calculated minimax is updated, alpha and beta help in exiting the cycle if it would be redoundant to analize more moves
      if(player == currentPlayer && n > minimax){
        minimax = n;
        if(alpha < minimax){
          alpha = minimax;
        }
        if(minimax > beta)break;
      }
      if(player != currentPlayer && n < minimax){
        minimax = n;
        if(beta > minimax){
          beta = minimax;
        }
        if(minimax < alpha)break;
      }
    }
  }

  //minimax is the score of the move so itìs returned
  return minimax;
}

function setAIsTurn(){//checksif it's the AI's turn and prepares things in cas it is

  if(isPlayerAI[player] && gameState == "playing"){

    let t0 = millis();
    let AIsMove = AIsTurn();
    mouseDisabled = true;
    //activates the AI after a little bit so the game can display each move one after the other instead of waiting for the AIs to finish first
    setTimeout(handleClickOnSide, t0-millis() + AI_IDLE_TIME, AIsMove);

  } else {
    mouseDisabled = false;
  }
}
