export const TIME_STEP = 1000 / 60;

//shape layers
export const GRABABLE_MASK_BIT = 1 << 31;
export const NOT_GRABABLE_MASK = ~GRABABLE_MASK_BIT;

//shape groups
export const NULL = 0; // assign to shapes to stop callback handlers
export const PLAYER = 1;
export const PLAYER_HAND = 2;
export const MONSTER = 10;
export const PROJECTILE = 12;
export const MAP = 50;
export const PROP = 100;
