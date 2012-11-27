console.log('Loading a web page');
var page = require('webpage').create();
var url = 'http://localhost:3501';
page.open(url, function (status) {
    //Page is loaded!
    console.log('Loaded with status', status);
    phantom.exit();
});