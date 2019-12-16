/**
 * @fileoverview This is a class encapsulating a Player.
 */
const Entity2D = require('./Entity2D');

const Util = require('../shared/Util');

/**
 * Constructor for a Player
 * @constructor
 * @param {string} id The socket ID of the Player
 * @param {number} x x coordinate (pixel)
 * @param {number} y y coordinate (pixel)
 * @param {number} score player score
 */
function Player(id,x,y,hitbox, score) {
  Entity2D.call(this, [x, y], null, null, null, null, hitbox);
  this.id = id;
  this.x=x;
  this.y=y;
  this.newDirection=1;
  this.score=score;
}
Util.extend(Player, Entity2D);

/**
 * Factory method for creating a Player
 * @param {string} id The socket ID of the Player
 * @param {number} x x coordinate (pixel)
 * @param {number} y y coordinate (pixel)
 * @param {number} score player score
 * @return {Player}
 */
Player.create = function(id,x,y,hitbox,score) {
  return new Player(id,x,y,hitbox,score);
};

/**
 * Updates the Player based on received input.
 * @param {Object} keyboardState The keyboard input received.
 */
Player.prototype.updateOnInput = function(keyboardState) {
  var my=(Number(keyboardState.down) - Number(keyboardState.up));
  var mx=(Number(keyboardState.right) - Number(keyboardState.left));
  if (my!=0 || mx!=0){
    if (Math.abs(mx)>Math.abs(my))
    {
      my=0;
      if (mx>0)
        this.newDirection=2;
      else
        this.newDirection=0;
    }
    else
    {
      mx=0;
      if (my>0)
        this.newDirection=3;
      else
        this.newDirection=1;

    }
    this.vy = 100 * my*3;
    this.vx = 100 * mx*3;
  
  }
};

/**
 * Steps the Player forward in time and updates the internal position, velocity, etc
 */
Player.prototype.update = function() {
  this.parent.update.call(this);
};

Player.prototype.isCollidedWith = function(other) {
  return this.parent.isCollidedWith.call(this,other);
};


module.exports = Player;
