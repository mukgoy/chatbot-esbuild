
export function resize(w,h){
    console.log(w,h);
    channel.iframe.style['width'] = w+"px";
    channel.iframe.style['height'] = h+"px";
}
export function toggleChatBox(isChatOpen, iframe){
    console.log(isChatOpen);
    iframe.classList.remove('isChatOpen');
    iframe.classList.remove('isChatClose');
    var className = isChatOpen ? "isChatOpen" : "isChatClose";
    iframe.classList.add(className);
}

export function dateTime(d = new Date()){
    return {
        getTimeStringLocal : function(){
            return d.getHours() +"-"+ d.getMinutes() +"-"+ d.getSeconds();
        },
        getTimeStringUTC : function(){
            return d.getUTCHours() +"-"+ d.getUTCMinutes() +"-"+ d.getUTCSeconds();
        },
        getTimeIntLocal : function(){
            return 60*60 * d.getHours() + 60 * d.getMinutes() + d.getSeconds();
        },
        getTimeIntUTC : function(){
            return 60*60 * d.getUTCHours() + 60 * d.getUTCMinutes() + d.getUTCSeconds();
        },
        getTime : function(){
            return parseInt(d.getTime()/1000);
        },
        getDay : function(){
            return d.getDay();
        },
    }
}
export function dateToTimeString(date){
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();
    return hours + ":" + minutes + ":" + seconds;
}
export function getDayName(index){
    var days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    return days[index];
}

export function addStyleSheet(fileName, cb) {
    var head = document.head;
    var link = document.createElement("link");
    link.type = "text/css";
    link.rel = "stylesheet";
    link.href = fileName;
    if(cb) {
        style.onload = cb;
    }
    head.appendChild(link);
}

export function linkify(inputText) {
    var replacedText, replacePattern1, replacePattern2, replacePattern3;

    //URLs starting with http://, https://, or ftp://
    replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
    replacedText = inputText.replace(replacePattern1, '<a href="$1" target="_blank">$1</a>');

    //URLs starting with "www." (without // before it, or it'd re-link the ones done above).
    replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
    replacedText = replacedText.replace(replacePattern2, '$1<a href="http://$2" target="_blank">$2</a>');

    //Change email addresses to mailto:: links.
    replacePattern3 = /(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gim;
    replacedText = replacedText.replace(replacePattern3, '<a href="mailto:$1">$1</a>');

    return replacedText;
}
export function urlProperty (url, field){
    if(url){
        var el = document.createElement('a');
        el.href = url;
        return el[field];
    }
    return '';
}

export function setThemeByBubbleVariables(bv, iframeId){
    const elem = document.getElementById(iframeId);
    if(bv.chatButtonPosition == 'left'){
        elem.style.left = bv.chatButtonMarginLeft + 'px';
    }else{
        elem.style.right = bv.chatButtonMarginRight + 'px';
    }
    elem.style.bottom = bv.chatButtonMarginBottom + 'px';
}