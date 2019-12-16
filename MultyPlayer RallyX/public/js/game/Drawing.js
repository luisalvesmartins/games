/**
 * @fileoverview Class handling the drawing of objects in the game.
 */
/**
 * Creates a Drawing object.
 * @param {CanvasRenderingContext2D} context The context this object will
 *   draw to.
 * @constructor
 */
function Drawing(context,zoom) {
  this.zoom=zoom;
  this.zoom16=this.zoom*16;
  this.zoom24=this.zoom*24;
  this.context = context;
  this.context.imageSmoothingEnabled = false;
  this.context.font="bold 20px Arial";
}

/**
 * This is a factory method for creating a Drawing object.
 * @param {CanvasRenderingContext2D} context The context this object will
 *   draw to.
 * @return {Drawing}
 */
Drawing.create = function(context,zoom) {
  return new Drawing(context,zoom);
};

/**
 * Clears the canvas context.
 */
Drawing.prototype.clear = function() {
  var canvas = this.context.canvas;
  this.context.clearRect(0, 0, canvas.width, canvas.height);
};

/**
 * Draws the player's sprite as a red circle.
 * @param {number} x The x coordinate of the player
 * @param {number} y The y coordinate of the player
 * @param {number} size The radial size of the player
 */
Drawing.prototype.drawSelf = function(x, y, size,dir,destroyed) {
  if (destroyed){
    var fs=fromSprite(0,12,24);
    this.context.drawImage(endMap, fs.x,fs.y,24,24, 
      x-4,y-4,this.zoom24,this.zoom24);
  }
  else
  {
    var sp=spriteFromDirection(dir);
    var fs=fromSprite(sp,12,16);
    this.context.drawImage(carsMap, fs.x,fs.y,16,16, 
      x,y,this.zoom16,this.zoom16);
  }
};

/**
 * Draws other players' sprite as a red circle.
 * @param {number} x The x coordinate of the player
 * @param {number} y The y coordinate of the player
 * @param {number} size The radial size of the player
 */
Drawing.prototype.drawOther = function(x, y, size,newDirection,destroyed) {
  if (destroyed){
    var fs=fromSprite(0,12,24);
    this.context.drawImage(endMap, fs.x,fs.y,24,24, 
      x-4,y-4,this.zoom24,this.zoom24);
  }
  else
  {
    var sp=spriteFromDirection(newDirection);
    var fs=fromSprite(24+sp,12,16);
    this.context.drawImage(carsMap, fs.x,fs.y,16,16, 
      x,y,this.zoom16,this.zoom16);
  }
};

/**
 * Draws the Flag sprite as a yellow circle.
 * @param {number} x The x coordinate of the player
 * @param {number} y The y coordinate of the player
 * @param {number} size The radial size of the player
 */
Drawing.prototype.drawFlag = function(x, y, size) {
  var fs=fromSprite(48,12,16);
  this.context.drawImage(carsMap, fs.x,fs.y,16,16, x,y,this.zoom16,this.zoom16);
};

Drawing.prototype.drawOpponent = function(opponent,x,y) {
  var sp=spriteFromDirection(opponent.newDirection);
  var fs=fromSprite(12+sp,12,16);
  this.context.drawImage(carsMap, fs.x,fs.y,16,16, 
    x,y,this.zoom16,this.zoom16);
};

Drawing.prototype.drawTerrain = function(x,y,value) {
  var v=value-1;
  if (v<0) v=0;
  var fs=fromSprite(v,7,24);
  this.context.drawImage(imageMap, fs.x,fs.y,24,24, x*this.zoom24,y*this.zoom24,this.zoom24,this.zoom24);
  //  this.context.fillText(value,x*this.zoom24,y*this.zoom24);
  //  this.context.fill();
};

function fromSprite(value,mapWidth,mapPixelWidth){
  var yy=Math.floor(value/mapWidth);
  var xx=value-yy*mapWidth;
  // if(xx<0)
  //   xx=0;
  return {x:xx*mapPixelWidth,y:yy*mapPixelWidth}
}

function spriteFromDirection(direction){
  var sp=0;
  switch (direction) {
    case 0:
      sp=9;
      break;
    case 1:
      sp=0;
      break;
    case 2:
      sp=3;
      break;
    case 3:
      sp=6;
      break;
    default:
      break;
  }
  return sp;
}