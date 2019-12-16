const Entity2D = require('./Entity2D');
const Util = require('../shared/Util');

/**
 * Constructor for a Opponent
 * @constructor
 * @param {string} id The socket ID of the Opponent
 */
function Opponent(id,x,y, hitbox) {
  Entity2D.call(this, [x, y], null, null, null, null, hitbox);
  this.id = id;
  this.vx=0;
  this.vy=-300;
  this.newDirection=1;
}
Util.extend(Opponent, Entity2D);

Opponent.HITBOX = 16;

/**
 * Factory method for creating a Opponent
 * @param {string} id The socket ID of the Opponent
 * @return {Opponent}
 */
Opponent.create = function(id,x,y,hitbox) {
  return new Opponent(id,x,y,hitbox);
};


/**
 * Steps the Opponent forward in time and updates the internal position, velocity,
 * etc.
 */
Opponent.prototype.update = function() {
  this.parent.update.call(this);
};

Opponent.prototype.isCollidedWith = function(other) {
  return this.parent.isCollidedWith.call(this,other);
};

module.exports = Opponent;
