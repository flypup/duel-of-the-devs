import global from '../global';
import GoalBasedInput from './GoalBasedInput';

export default class ShadowCloneInput extends GoalBasedInput {

    constructor() {
        super();
        if (global.debug > 1 && this.constructor === ShadowCloneInput) {
            Object.seal(this);
        }
    }
}

global.inputs.ShadowCloneInput = ShadowCloneInput;
