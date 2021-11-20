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
    ...env_prod,
    // ...env_dev,
    iframeId : 'childId',
    bv : bubbleVariables
}