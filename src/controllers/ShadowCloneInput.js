import global from '../global.js';
import GoalBasedInput from './GoalBasedInput.js';

export default class ShadowCloneInput extends GoalBasedInput {

    constructor() {
        super();
        if (global.debug > 1 && this.constructor === ShadowCloneInput) {
            Object.seal(this);
        }
    }
}

global.inputs.ShadowCloneInput = ShadowCloneInput;
