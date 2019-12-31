module.exports = {
    "env": {
        "browser": true,
        "es6": true
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "sourceType": "module"
    },
    "globals": {
        "cp": true,
        "THREE": true,
        "Stats": true,
        "dat": true,
        "requestAnimationFrame": true,
        "cancelAnimationFrame": true,
        "jQuery": false,
        "exports": false,
        "module": false
    },
    "rules": {
        "indent": [
            "error",
            4
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "no-var": "error",
        "prefer-const": "error",
        "quotes": [
            "error",
            "single"
        ],
        "semi": [
            "error",
            "always"
        ],
        "no-global-assign": [
            "error",
            {
                "exceptions": ["Object"]
            }
        ],
        "no-console": "off"
    }
};
