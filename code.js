let toresize = false;
let BODY = null;

const GRID_SIZE = 6;
const GRID_LENGTH = 600;
const RADIUS = 10;
const MARGIN = 10;
const ENDINGCARD_SIZE = 900;
let C1;
let C2;
let C_NEUTRAL;

let x, y, clickHasHappened;
let squares;
let sides;
let player;
let score;
let gameEnded;
let endingTime;

function setup() {//creates the canvas and sets everything that needs to be set before the game starts
  let c = createCanvas(100, 100);

  C1 = color(40, 100, 255);
  C2 = color(255, 100, 10);
  C_NEUTRAL = color(200);

  setGame();

}

function setGame(){//sets every value related to the game like resetting the score, clearing the grid and so on

  score = {p1:0, p2:0};
  player = "p1";
  sides = [];
  squares = [];
  clickHasHappened = false;
  gameEnded = false;

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

      sides.push({c:C_NEUTRAL, squares:[]});//each side contains a color and a list of adjacent squares

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
      sides.push({c:C_NEUTRAL, squares:[]});
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
    if(square.sides[i].c == C_NEUTRAL)return false;
  }
  return true;//if after checking every side none of them are neutral the square is complete, we return true
}

function handleClickOnSide(side){//decides what to do after the player clicked on a side

  if(!gameEnded){//sides must only be clickable if the game is playing

    clickHasHappened = false;

    if(side.c == C_NEUTRAL){//checks if the side is neutral or has been previously colored, if it isn't neutral nothing should be done

      let complete = false;
      side.c = (player=="p1" ? C1 : C2); //colors the side based on which player is currently active

      for(let i=0;i<side.squares.length;i++){//cycling through all the square that are adjacent to the side that has been clicked
        let square = side.squares[i];
        if(isSquareComplete(square)){//if the square is now complete we need to change it's color and increase the score of the active player
          complete = true;
          square.c = side.c;
          if(player == "p1")score.p1++;
          else score.p2++;
          if(score.p1 + score.p2 == (GRID_SIZE - 1)*(GRID_SIZE - 1)){//set an ending flag to display the ending scene
            gameEnded = true;
            endingTime = millis();
          }
        }
      }
      if(!complete)player = (player=="p1" ? "p2" : "p1");//if no square has been completed the active player should change, otherwise nothing happens
    }
  }
}

function draw() {//function that gets called every frame, used to display stuff on screen and to handle the logic of the game


  background(255);
  if(toresize)resize();

  //scaling and translating to make the origin of the coordinate system the center of the screen and to scale everything nicely
  translate(width/2, height/2);
  scale(min(width, height)/1000, min(width,height)/1000);

  noStroke();


  //displaying the scores of each player
  textSize(30);
  fill(C1);
  text(score.p1, -GRID_LENGTH/4, -GRID_LENGTH/1.5);
  fill(0);
  text(":", 0, -GRID_LENGTH/1.5);
  fill(C2);
  text(score.p2, GRID_LENGTH/4, -GRID_LENGTH/1.5);

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

  if(gameEnded){//if the game ended the endscreen is shown

    if(millis()-endingTime <= 1500)fill(255, map(millis()-endingTime, 0, 1500, 0, 230));//this is just a way to animate a fadein
    else fill(255, 230);
    rect(-ENDINGCARD_SIZE/2, -ENDINGCARD_SIZE/2, ENDINGCARD_SIZE, ENDINGCARD_SIZE);

    if(millis()-endingTime > 1500){

      //depending on who won a different text is displayed
      if(score.p1 > score.p2){
        fill(C1);
        textSize(40);
        textAlign(CENTER, CENTER);
        text("Player 1 won!!", 0, 0);
      }
      if(score.p1 < score.p2){
        fill(C2);
        textSize(40);
        textAlign(CENTER, CENTER);
        text("Player 2 won!!", 0, 0);
      }
      if(score.p1 == score.p2){
        fill(C_NEUTRAL);
        textSize(40);
        textAlign(CENTER, CENTER);
        text("A tie, oh well", 0, 0);
      }
    }

    if(millis()-endingTime > 1700){
      if(millis()-endingTime <= 2300)C_NEUTRAL.setAlpha(map(millis()-endingTime, 1700, 2300, 0, 255));//another animation, this time for the play again button
      fill(C_NEUTRAL);
      C_NEUTRAL.setAlpha(255);
      let bttnW = textWidth("Play Again") + MARGIN;
      let bttnH = 40 + MARGIN;
      rect(-bttnW/2, GRID_LENGTH/4 - bttnH/2, bttnW, bttnH, 10);//displaying the button

      if(millis()-endingTime <= 2300)fill(255, map(millis()-endingTime, 1700, 2300, 0, 255));
      else{
        fill(255);
        if(clickHasHappened){//checking if the button has been clicked
          if(x>=-bttnW/2 && x<=-bttnW/2 + bttnW){
            if(y>=GRID_LENGTH/4 - bttnH/2 && y<=GRID_LENGTH/4 - bttnH/2 + bttnH){
              setGame();//resets the state of the game
            }
          }
        }
      }
      textSize(40);
      textAlign(CENTER, CENTER);
      text("Play Again", 0, GRID_LENGTH/4);
    }
  }

  //this is done to make sure that during the next frame the program doesn't mistakenly think lefmouse has been clicked again
  clickHasHappened = false;

}
