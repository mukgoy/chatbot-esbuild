var pathToRegex = require('path-to-regex');
var routes = [
    '/o/:orgId/:flowId/:jobId',
    '/o/:orgId/:flowId',
    '/u/:userId/:flowId/:jobId',
    '/u/:userId/:flowId',
];

if(!bubbleVariables.flowId){
    bubbleVariables.flowId = 1;
}

routes.forEach(route=>{
    let parser = new pathToRegex(route);
    let result = parser.match(window.location.pathname);
    if(result){
        for(let key in result){
            bubbleVariables[key] = result[key];
        }
    }
});

export var env_prod = {
    isDevMode: false,
    botURL : "https://dev.intelliassist.co/mukesh/mychatbot",
    cssURL : "https://dev.intelliassist.co/mukesh/mychatbot/assets/css/embed.css"
}

export var env_dev = {
    isDevMode: true,
    botURL : "http://localhost:4200",
    cssURL : "http://localhost:4200/assets/css/embed.css"
}

export var env = {
    // ...env_prod,
    ...env_dev,
    iframeId : 'childId',
    bv : bubbleVariables
}