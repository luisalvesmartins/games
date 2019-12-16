const Entity2D = require('./Entity2D');

const Util = require('../shared/Util');

/**
 * Constructor for a Player
 * @constructor
 * @param {string} id The socket ID of the Player
 */
function Flag(id,x,y,hitbox) {
  Entity2D.call(this, [0, 0], null, null, null, null, hitbox);
  this.id = id;
  this.x=x;
  this.y=y;
}
Util.extend(Flag, Entity2D);

/**
 * Factory method for creating a Player
 * @param {string} id The socket ID of the Player
 * @return {Player}
 */
Flag.create = function(id,x,y, hitbox) {
  return new Flag(id,x,y,hitbox);
};

module.exports = Flag;
