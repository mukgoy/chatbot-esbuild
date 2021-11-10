import Channel from 'js-channel'
import {env} from '../shared/config'
import {toggleChatBox} from '../shared/helper'
import {visitor} from '../shared/useragent'

export var channelChild = (function () {

    if(true){
        var chan = null;
        var resolve;
        var promise = new Promise(function(res, rej){
            resolve = res;
        });
        var onload = function(){
            chan = Channel.build({
                debugOutput: true,
                window: document.getElementById("childId").contentWindow,
                origin: "*",
                scope: "testScope"
            });
            initBind();
            resolve(chan);
        };
        var iframe = document.createElement("iframe");
        iframe.id = "childId";
        iframe.classList.add("isChatClose");
        iframe.style.display = "none"; 
        document.body.appendChild(iframe);
        if (window.addEventListener) {
            iframe.addEventListener("load", function(){ onload(); }, false);
        }else if (iframe.attachEvent){
            iframe.attachEvent("onload", function(){ onload(); }, false);
        }
        iframe.src = env.botURL;
    }

    function initBind(){
        chan.bind("toggleChatBox", function(t, s) {
            toggleChatBox(s, iframe);
        });

        console.log(visitor);
        chan.bind("getVisitorInfo", function(t, s) {
            return visitor;
        });
        
    }

    return {
        iframe : iframe,
        promise : promise,
        reverse : function(){
            chan.call({
                method: "reverse",
                params: "hello world! outer world",
                success: function(v) {
                    console.log(1, "function returns: '" + v + "'" );
                }
            });
        }
    }
})();