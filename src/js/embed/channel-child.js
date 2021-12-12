import Channel from 'js-channel'
import {env} from '../shared/config'
import {toggleChatBox, setThemeByBubbleVariables} from '../shared/helper'
import {visitor} from '../shared/useragent'

export var channelChild = (function () {

    if(true){
        var iframeBubbleSize = {
            width : 50,
            height: 50
          };
        var chan = null;
        var resolve;
        var promise = new Promise(function(res, rej){
            resolve = res;
        });
        var onload = function(){
            chan = Channel.build({
                debugOutput: false,
                window: document.getElementById(env.iframeId).contentWindow,
                origin: "*",
                scope: "testScope"
            });
            initBind();
            setThemeByBubbleVariables(env.bv.chatButtonSetting, env.iframeId, visitor);
            resolve(chan);
        };
        
        var iframe = document.createElement("iframe");
        iframe.id = env.iframeId;
        iframe.classList.add("isChatClose");
        iframe.classList.add("chatbotInitiating");
        // iframe.style.display = "none"; 
        document.body.appendChild(iframe);
        if (window.addEventListener) {
            iframe.addEventListener("load", function(){ onload(); }, false);
        }else if (iframe.attachEvent){
            iframe.attachEvent("onload", function(){ onload(); }, false);
        }
        iframe.src = env.botURL;
    }

    function initBind(){
        chan.bind("initChatBox", function(t, _iframeBubbleSize) {
            iframeBubbleSize = _iframeBubbleSize
            console.log(_iframeBubbleSize)
            iframe.classList.remove("chatbotInitiating");
            iframe.width  = iframeBubbleSize.width;
            iframe.height = iframeBubbleSize.height;
        });

        chan.bind("toggleChatBox", function(t, isChatOpen) {
            toggleChatBox(isChatOpen, iframe, iframeBubbleSize);
        });

        chan.bind("getVisitorInfo", function(t, s) {
            return visitor;
        });

        chan.bind("getBubbleVariables", function(t, s) {
            return env.bv;
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