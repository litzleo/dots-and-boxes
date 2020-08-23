let toresize = false;
let BODY = null;

const GRID_SIZE = 6;
const GRID_LENGTH = 600;
const RADIUS = 10;
const MARGIN = 10;
const ENDINGCARD_SIZE = 900;
const AMOUNT_OF_PLAYERS = 2;
let COLORS = [];

let x, y, clickHasHappened;
let squares;
let sides;
let player;
let score;
let gameState;

function setup() {//creates the canvas and sets everything that needs to be set before the game starts
  let c = createCanvas(100, 100);

  //list of colors used for the different players (color 0 is the neutral color used for menus and stuff)
  COLORS.push(color(200));//gray
  COLORS.push(color(40, 70, 255));//blue
  COLORS.push(color(255, 60, 10));//red
  COLORS.push(color(30, 255, 50));//green
  COLORS.push(color(255, 240, 50));//yellow
  COLORS.push(color(200, 20, 255));//purple
  COLORS.push(color(20, 230, 255));//cyan
  COLORS.push(color(10, 10, 10));//black

  gameState = "menu";

}

function setGame(){//sets every value related to the game like resetting the score, clearing the grid and so on

  score = [];
  score.push(0);
  for(let i=0; i<AMOUNT_OF_PLAYERS; i++){
    score.push(0);
  }
  player = 1;
  sides = [];
  squares = [];
  clickHasHappened = false;
  gameState = "playing";

  //creating the squares
  for(let i=0; i<GRID_SIZE-1; i++){
    squares[i] = [];
    for(let j=0; j<GRID_SIZE-1; j++){
      squares[i].push({c:color(255), sides:[]});//each square contains a color and a list of adjacent sides
    }
  }

  //creating the sides, this is done twice, to handle horizontal and vertical sides
  for(let i=0; i<GRID_SIZE-1; i++){
    for(let j=0; j<GRID_SIZE; j++){

      sides.push({c:COLORS[0], squares:[]});//each side contains a color and a list of adjacent squares

      //adding all the adjacent squares to the corresponding list contained in the side and adding the side to the corrisponding lists contained in the squares
      //if statements are needed to handle cases where a side borders empy space and so doesn't have a square on one side
      if(j-1>=0){
        sides[sides.length-1].squares.push(squares[i][j-1]);
        squares[i][j-1].sides.push(sides[sides.length-1]);
      }
      if(j<GRID_SIZE-1){
        sides[sides.length-1].squares.push(squares[i][j]);
        squares[i][j].sides.push(sides[sides.length-1]);
      }
    }
  }

  //similar code to the block above, this one handles vertical sides
  for(let i=0; i<GRID_SIZE; i++){
    for(let j=0; j<GRID_SIZE-1; j++){
      sides.push({c:COLORS[0], squares:[]});
      if(i-1>=0){
        sides[sides.length-1].squares.push(squares[i-1][j]);
        squares[i-1][j].sides.push(sides[sides.length-1]);
      }
      if(i<GRID_SIZE-1){
        sides[sides.length-1].squares.push(squares[i][j]);
        squares[i][j].sides.push(sides[sides.length-1]);
      }
    }
  }
}

function windowResized() {//whenever the window changes size resize is called
  resize();
}

document.addEventListener('DOMContentLoaded', (event) => {//sets a variable to force a call to the function resize when the document is fully loaded, yup, it's technical boring stuff
  toresize = true;
})

function resize(){//resizes the canvas depending on the size of the body

    toresize = false;

    if(BODY == null)BODY = document.body;
    w = BODY.offsetWidth;
    h = BODY.offsetHeight;

    resizeCanvas(w, h);
}



function mouseClicked() {//when a player clicks the coordinates of the cursor (adjusted to the coordinate system used for rendering objects) are stored
  x = width * map(mouseX, 0, width, -500/min(width, height), 500/min(width, height));
  y = height * map(mouseY, 0, height, -500/min(width, height), 500/min(width, height));
  clickHasHappened = true;
}

function isSquareComplete(square){//returns if the square has every side colored or not
  for(let i=0;i<square.sides.length;i++){//cycles through every side that borders the square, if at least one of them is neutral we return false
    if(square.sides[i].c == COLORS[0])return false;
  }
  return true;//if after checking every side none of them are neutral the square is complete, we return true
}

function handleClickOnSide(side){//decides what to do after the player clicked on a side

  if(gameState == "playing"){//sides must only be clickable if the game is playing

    clickHasHappened = false;

    if(side.c == COLORS[0]){//checks if the side is neutral or has been previously colored, if it isn't neutral nothing should be done

      let complete = false;
      side.c = COLORS[player]; //colors the side based on which player is currently active

      for(let i=0;i<side.squares.length;i++){//cycling through all the square that are adjacent to the side that has been clicked
        let square = side.squares[i];
        if(isSquareComplete(square)){//if the square is now complete we need to change it's color and increase the score of the active player
          complete = true;
          square.c = side.c;
          score[player]++;
          score[0]++;
          if(score[0] == (GRID_SIZE - 1)*(GRID_SIZE - 1)){//set an ending flag to display the ending scene
            gameState = "ended";
            endingTime = millis();
          }
        }
      }
      if(!complete){//if no square has been completed the active player should change, otherwise nothing happens
        player++;
        if(player == AMOUNT_OF_PLAYERS+1)player = 1;
      }
    }
  }
}

function handleButton(xPos, yPos, size, innerText, textColor, bttnColor, callback){

  let bttnW = textWidth(innerText) + MARGIN;
  let bttnH = size + MARGIN;

  if(clickHasHappened){//checking if the button has been clicked
    if(x>=xPos && x<=xPos + bttnW){
      if(y>=yPos && y<=yPos + bttnH){
        callback();//if the button has been clicked the callback function is called
      }
    }
  }

  fill(bttnColor);
  rect(xPos, yPos, bttnW, bttnH, 10);
  fill(textColor);
  textSize(size);
  textAlign(LEFT, TOP);
  text(innerText, xPos + MARGIN/2, yPos + MARGIN/2);
}

function displayGame(){//displays the game and performs the logic associated with it

  //displaying the scores of each player
  textSize(30);
  for(let i=1; i<=AMOUNT_OF_PLAYERS; i++){
    fill(COLORS[i]);
    text(score[i], map(i, 1, AMOUNT_OF_PLAYERS, -GRID_LENGTH/3.5, GRID_LENGTH/3.5), -GRID_LENGTH/1.5);
    fill(0);
    if(i < AMOUNT_OF_PLAYERS)text(":", map(i+0.5, 1, AMOUNT_OF_PLAYERS, -GRID_LENGTH/3.5, GRID_LENGTH/3.5), -GRID_LENGTH/1.5);
  }

  //displaying the squares
  for(let i=0; i<GRID_SIZE-1; i++){
    for(let j=0; j<GRID_SIZE-1; j++){
      fill(squares[i][j].c);
      rect(map(i, 0, GRID_SIZE-1, -GRID_LENGTH/2, GRID_LENGTH/2)+MARGIN,
        map(j, 0, GRID_SIZE-1, -GRID_LENGTH/2, GRID_LENGTH/2)+MARGIN,
        GRID_LENGTH/(GRID_SIZE-1)-2*MARGIN);
    }
  }

  //displaying the sides
  let ind = 0;
  for(let i=0; i<GRID_SIZE-1; i++){
    for(let j=0; j<GRID_SIZE; j++){
      fill(sides[ind].c);
      let rx = map(i, 0, GRID_SIZE-1, -GRID_LENGTH/2, GRID_LENGTH/2) - RADIUS/2;
      let ry = map(j, 0, GRID_SIZE-1, -GRID_LENGTH/2, GRID_LENGTH/2) - RADIUS/2;
      let rw = GRID_LENGTH/(GRID_SIZE-1);
      let rh = RADIUS;

      //if a player clicked we check if the mouse is on one of the sides, in which case we call handleClickOnSide to deal with it
      if(clickHasHappened){
        if(x>=rx && x<=rx+rw){
          if(y>=ry-MARGIN && y<=ry+rh+MARGIN){
            handleClickOnSide(sides[ind]);
          }
        }
      }
      rect(rx, ry, rw, rh);
      ind++;
    }
  }

  //basically a copy of the previous block of code, to handle the sides it's easier to do horizontals and verticals separatedly
  for(let i=0; i<GRID_SIZE; i++){
    for(let j=0; j<GRID_SIZE-1; j++){
      fill(sides[ind].c);
      let rx = map(i, 0, GRID_SIZE-1, -GRID_LENGTH/2, GRID_LENGTH/2) - RADIUS/2;
      let ry = map(j, 0, GRID_SIZE-1, -GRID_LENGTH/2, GRID_LENGTH/2) - RADIUS/2;
      let rw = RADIUS;
      let rh = GRID_LENGTH/(GRID_SIZE-1);
      if(clickHasHappened){
        if(x>=rx-MARGIN && x<=rx+rw+MARGIN){
          if(y>=ry && y<=ry+rh){
            handleClickOnSide(sides[ind]);
          }
        }
      }
      rect(rx, ry, rw, rh);
      ind++;
    }
  }


  //displaying the dots between sides
  fill(0);
  for(let i=0; i<GRID_SIZE; i++){
    for(let j=0; j<GRID_SIZE; j++){
      circle(map(i, 0, GRID_SIZE-1, -GRID_LENGTH/2, GRID_LENGTH/2), map(j, 0, GRID_SIZE-1, -GRID_LENGTH/2, GRID_LENGTH/2), RADIUS);
    }
  }
}

function displayEnding(){//displays the ending scene

  displayGame();

  if(millis()-endingTime <= 1500)fill(255, map(millis()-endingTime, 0, 1500, 0, 230));//this is just a way to animate a fadein
  else fill(255, 230);
  rect(-ENDINGCARD_SIZE/2, -ENDINGCARD_SIZE/2, ENDINGCARD_SIZE, ENDINGCARD_SIZE);

  if(millis()-endingTime > 1500){

    //depending on who won a different text is displayed
    let maxScore = 0;
    for(let i=1; i<=AMOUNT_OF_PLAYERS; i++){//finding the bigger score
      if(score[i] > maxScore)maxScore = score[i];
    }
    let winners = [];
    for(let i=1; i<=AMOUNT_OF_PLAYERS; i++){//finding all the winners (those that have a score equale to the best score)
      if(score[i] == maxScore)winners.push(i);
    }

    if(winners.length == 1){//if there's only 1 winner GG, let's congratulate them
      fill(COLORS[winners[0]]);
      textSize(40);
      textAlign(CENTER, CENTER);
      text("Player "+winners[0]+" won!!", 0, 0);
    }
    else if(winners.length < AMOUNT_OF_PLAYERS){//if there are multiple winners and not every player won GG, let's congratulate them
      fill(COLORS[0]);
      textSize(40);
      textAlign(CENTER, CENTER);
      let winnersList = "";
      for(let i=0; i<winners.length; i++){//creating a string with all the winners
        winnersList += winners[i];
        if(i<winners.length-1)winnersList += ", ";
      }
      text("Players "+winnersList+" won!!", 0, 0);
    }
    else{//if everyone has the same score let's celebrate the tie I guess, I mean, it's a tie, who cares
      fill(COLORS[0]);
      textSize(40);
      textAlign(CENTER, CENTER);
      text("A tie, oh well", 0, 0);
    }
  }

  if(millis()-endingTime > 1700){//After a bit the replay and menu buttons get displayed

    let playText = "Play Again";
    let bttn1W = textWidth(playText) + MARGIN;
    let bttn1H = 40 + MARGIN;

    let menuText = "Menu";
    let bttn2W = textWidth(menuText) + MARGIN;
    let bttn2H = 40 + MARGIN;

    let textColor = color(255);
    if(millis()-endingTime <= 2300){
      COLORS[0].setAlpha(map(millis()-endingTime, 1700, 2300, 0, 255));
      textColor.setAlpha(map(millis()-endingTime, 1700, 2300, 0, 255));
    }
    handleButton(-bttn1W/2 - GRID_LENGTH/4, GRID_LENGTH/4 - bttn1H/2, 40, playText, textColor, COLORS[0], setGame);
    handleButton(-bttn2W/2 + GRID_LENGTH/4, GRID_LENGTH/4 - bttn2H/2, 40, menuText, textColor, COLORS[0], setGame);
    COLORS[0].setAlpha(255);
  }
}

function displayMenu(){//displays the menu
  let playText = "Play";
  let bttnW = textWidth(playText) + MARGIN;
  handleButton(-bttnW/2, 0, 40, playText, color(255), COLORS[0], setGame);
}

function draw() {//function that gets called every frame, used to display stuff on screen and to handle the logic of the game

  background(255);
  if(toresize)resize();

  //scaling and translating to make the origin of the coordinate system the center of the screen and to scale everything nicely
  translate(width/2, height/2);
  scale(min(width, height)/1000, min(width,height)/1000);

  noStroke();

  //depending on the state of the game a different scene is displayed (and different calculations are performed)
  if(gameState == "menu")displayMenu();

  if(gameState == "playing")displayGame();

  if(gameState == "ended")displayEnding();

  //this is done to make sure that during the next frame the program doesn't mistakenly think lefmouse has been clicked again
  clickHasHappened = false;

}
