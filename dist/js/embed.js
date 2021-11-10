(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[Object.keys(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __reExport = (target, module, desc) => {
    if (module && typeof module === "object" || typeof module === "function") {
      for (let key of __getOwnPropNames(module))
        if (!__hasOwnProp.call(target, key) && key !== "default")
          __defProp(target, key, { get: () => module[key], enumerable: !(desc = __getOwnPropDesc(module, key)) || desc.enumerable });
    }
    return target;
  };
  var __toModule = (module) => {
    return __reExport(__markAsModule(__defProp(module != null ? __create(__getProtoOf(module)) : {}, "default", module && module.__esModule && "default" in module ? { get: () => module.default, enumerable: true } : { value: module, enumerable: true })), module);
  };

  // node_modules/js-channel/src/jschannel.js
  var require_jschannel = __commonJS({
    "node_modules/js-channel/src/jschannel.js"(exports, module) {
      var Channel2 = function() {
        "use strict";
        var s_curTranId = Math.floor(Math.random() * 1000001);
        var s_boundChans = {};
        function s_addBoundChan(win, origin, scope, handler) {
          function hasWin(arr) {
            for (var i = 0; i < arr.length; i++)
              if (arr[i].win === win)
                return true;
            return false;
          }
          var exists = false;
          if (origin === "*") {
            for (var k in s_boundChans) {
              if (!s_boundChans.hasOwnProperty(k))
                continue;
              if (k === "*")
                continue;
              if (typeof s_boundChans[k][scope] === "object") {
                exists = hasWin(s_boundChans[k][scope]);
                if (exists)
                  break;
              }
            }
          } else {
            if (s_boundChans["*"] && s_boundChans["*"][scope]) {
              exists = hasWin(s_boundChans["*"][scope]);
            }
            if (!exists && s_boundChans[origin] && s_boundChans[origin][scope]) {
              exists = hasWin(s_boundChans[origin][scope]);
            }
          }
          if (exists)
            throw "A channel is already bound to the same window which overlaps with origin '" + origin + "' and has scope '" + scope + "'";
          if (typeof s_boundChans[origin] != "object")
            s_boundChans[origin] = {};
          if (typeof s_boundChans[origin][scope] != "object")
            s_boundChans[origin][scope] = [];
          s_boundChans[origin][scope].push({ win, handler });
        }
        function s_removeBoundChan(win, origin, scope) {
          var arr = s_boundChans[origin][scope];
          for (var i = 0; i < arr.length; i++) {
            if (arr[i].win === win) {
              arr.splice(i, 1);
            }
          }
          if (s_boundChans[origin][scope].length === 0) {
            delete s_boundChans[origin][scope];
          }
        }
        function s_isArray(obj) {
          if (Array.isArray)
            return Array.isArray(obj);
          else {
            return obj.constructor.toString().indexOf("Array") != -1;
          }
        }
        var s_transIds = {};
        var s_onMessage = function(e) {
          try {
            var m = JSON.parse(e.data);
            if (typeof m !== "object" || m === null)
              throw "malformed";
          } catch (e2) {
            return;
          }
          var w = e.source;
          var o = e.origin;
          var s, i, meth;
          if (typeof m.method === "string") {
            var ar = m.method.split("::");
            if (ar.length == 2) {
              s = ar[0];
              meth = ar[1];
            } else {
              meth = m.method;
            }
          }
          if (typeof m.id !== "undefined")
            i = m.id;
          if (typeof meth === "string") {
            var delivered = false;
            if (s_boundChans[o] && s_boundChans[o][s]) {
              for (var j = 0; j < s_boundChans[o][s].length; j++) {
                if (s_boundChans[o][s][j].win === w) {
                  s_boundChans[o][s][j].handler(o, meth, m);
                  delivered = true;
                  break;
                }
              }
            }
            if (!delivered && s_boundChans["*"] && s_boundChans["*"][s]) {
              for (var j = 0; j < s_boundChans["*"][s].length; j++) {
                if (s_boundChans["*"][s][j].win === w) {
                  s_boundChans["*"][s][j].handler(o, meth, m);
                  break;
                }
              }
            }
          } else if (typeof i != "undefined") {
            if (s_transIds[i])
              s_transIds[i](o, meth, m);
          }
        };
        if (window.addEventListener)
          window.addEventListener("message", s_onMessage, false);
        else if (window.attachEvent)
          window.attachEvent("onmessage", s_onMessage);
        return {
          build: function(cfg) {
            var debug = function(m) {
              if (cfg.debugOutput && window.console && window.console.log) {
                try {
                  if (typeof m !== "string")
                    m = JSON.stringify(m);
                } catch (e) {
                }
                console.log("[" + chanId + "] " + m);
              }
            };
            if (!window.postMessage)
              throw "jschannel cannot run this browser, no postMessage";
            if (!window.JSON || !window.JSON.stringify || !window.JSON.parse) {
              throw "jschannel cannot run this browser, no JSON parsing/serialization";
            }
            if (typeof cfg != "object")
              throw "Channel build invoked without a proper object argument";
            if (!cfg.window || !cfg.window.postMessage)
              throw "Channel.build() called without a valid window argument";
            if (window === cfg.window)
              throw "target window is same as present window -- not allowed";
            var validOrigin = false;
            if (typeof cfg.origin === "string") {
              var oMatch;
              if (cfg.origin === "*")
                validOrigin = true;
              else if ((oMatch = cfg.origin.match(/^https?:\/\/(?:[-a-zA-Z0-9_\.])+(?::\d+)?/)) !== null) {
                cfg.origin = oMatch[0].toLowerCase();
                validOrigin = true;
              }
            }
            if (!validOrigin)
              throw "Channel.build() called with an invalid origin";
            if (typeof cfg.scope !== "undefined") {
              if (typeof cfg.scope !== "string")
                throw "scope, when specified, must be a string";
              if (cfg.scope.split("::").length > 1)
                throw "scope may not contain double colons: '::'";
            }
            var chanId = function() {
              var text = "";
              var alpha = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
              for (var i = 0; i < 5; i++)
                text += alpha.charAt(Math.floor(Math.random() * alpha.length));
              return text;
            }();
            var regTbl = {};
            var outTbl = {};
            var inTbl = {};
            var ready = false;
            var pendingQueue = [];
            var createTransaction = function(id, origin, callbacks) {
              var shouldDelayReturn = false;
              var completed = false;
              return {
                origin,
                invoke: function(cbName, v) {
                  if (!inTbl[id])
                    throw "attempting to invoke a callback of a nonexistent transaction: " + id;
                  var valid = false;
                  for (var i = 0; i < callbacks.length; i++)
                    if (cbName === callbacks[i]) {
                      valid = true;
                      break;
                    }
                  if (!valid)
                    throw "request supports no such callback '" + cbName + "'";
                  postMessage({ id, callback: cbName, params: v });
                },
                error: function(error, message) {
                  completed = true;
                  if (!inTbl[id])
                    throw "error called for nonexistent message: " + id;
                  delete inTbl[id];
                  postMessage({ id, error, message });
                },
                complete: function(v) {
                  completed = true;
                  if (!inTbl[id])
                    throw "complete called for nonexistent message: " + id;
                  delete inTbl[id];
                  postMessage({ id, result: v });
                },
                delayReturn: function(delay) {
                  if (typeof delay === "boolean") {
                    shouldDelayReturn = delay === true;
                  }
                  return shouldDelayReturn;
                },
                completed: function() {
                  return completed;
                }
              };
            };
            var setTransactionTimeout = function(transId, timeout, method) {
              return window.setTimeout(function() {
                if (outTbl[transId]) {
                  var msg = "timeout (" + timeout + "ms) exceeded on method '" + method + "'";
                  (1, outTbl[transId].error)("timeout_error", msg);
                  delete outTbl[transId];
                  delete s_transIds[transId];
                }
              }, timeout);
            };
            var onMessage = function(origin, method, m) {
              if (typeof cfg.gotMessageObserver === "function") {
                try {
                  cfg.gotMessageObserver(origin, m);
                } catch (e) {
                  debug("gotMessageObserver() raised an exception: " + e.toString());
                }
              }
              if (m.id && method) {
                if (regTbl[method]) {
                  var trans = createTransaction(m.id, origin, m.callbacks ? m.callbacks : []);
                  inTbl[m.id] = {};
                  try {
                    if (m.callbacks && s_isArray(m.callbacks) && m.callbacks.length > 0) {
                      for (var i = 0; i < m.callbacks.length; i++) {
                        var path = m.callbacks[i];
                        var obj2 = m.params;
                        var pathItems = path.split("/");
                        for (var j = 0; j < pathItems.length - 1; j++) {
                          var cp = pathItems[j];
                          if (typeof obj2[cp] !== "object")
                            obj2[cp] = {};
                          obj2 = obj2[cp];
                        }
                        obj2[pathItems[pathItems.length - 1]] = function() {
                          var cbName = path;
                          return function(params) {
                            return trans.invoke(cbName, params);
                          };
                        }();
                      }
                    }
                    var resp = regTbl[method](trans, m.params);
                    if (!trans.delayReturn() && !trans.completed())
                      trans.complete(resp);
                  } catch (e) {
                    var error = "runtime_error";
                    var message = null;
                    if (typeof e === "string") {
                      message = e;
                    } else if (typeof e === "object") {
                      if (e && s_isArray(e) && e.length == 2) {
                        error = e[0];
                        message = e[1];
                      } else if (typeof e.error === "string") {
                        error = e.error;
                        if (!e.message)
                          message = "";
                        else if (typeof e.message === "string")
                          message = e.message;
                        else
                          e = e.message;
                      }
                    }
                    if (message === null) {
                      try {
                        message = JSON.stringify(e);
                        if (typeof message == "undefined")
                          message = e.toString();
                      } catch (e2) {
                        message = e.toString();
                      }
                    }
                    trans.error(error, message);
                  }
                }
              } else if (m.id && m.callback) {
                if (!outTbl[m.id] || !outTbl[m.id].callbacks || !outTbl[m.id].callbacks[m.callback]) {
                  debug("ignoring invalid callback, id:" + m.id + " (" + m.callback + ")");
                } else {
                  outTbl[m.id].callbacks[m.callback](m.params);
                }
              } else if (m.id) {
                if (!outTbl[m.id]) {
                  debug("ignoring invalid response: " + m.id);
                } else {
                  if (m.error) {
                    (1, outTbl[m.id].error)(m.error, m.message);
                  } else {
                    if (m.result !== void 0)
                      (1, outTbl[m.id].success)(m.result);
                    else
                      (1, outTbl[m.id].success)();
                  }
                  delete outTbl[m.id];
                  delete s_transIds[m.id];
                }
              } else if (method) {
                if (regTbl[method]) {
                  regTbl[method]({ origin }, m.params);
                }
              }
            };
            s_addBoundChan(cfg.window, cfg.origin, typeof cfg.scope === "string" ? cfg.scope : "", onMessage);
            var scopeMethod = function(m) {
              if (typeof cfg.scope === "string" && cfg.scope.length)
                m = [cfg.scope, m].join("::");
              return m;
            };
            var postMessage = function(msg, force) {
              if (!msg)
                throw "postMessage called with null message";
              var verb = ready ? "post  " : "queue ";
              debug(verb + " message: " + JSON.stringify(msg));
              if (!force && !ready) {
                pendingQueue.push(msg);
              } else {
                if (typeof cfg.postMessageObserver === "function") {
                  try {
                    cfg.postMessageObserver(cfg.origin, msg);
                  } catch (e) {
                    debug("postMessageObserver() raised an exception: " + e.toString());
                  }
                }
                cfg.window.postMessage(JSON.stringify(msg), cfg.origin);
              }
            };
            var onReady = function(trans, type) {
              debug("ready msg received");
              if (ready)
                throw "received ready message while in ready state.  help!";
              if (type === "ping") {
                chanId += "-R";
              } else {
                chanId += "-L";
              }
              obj.unbind("__ready");
              ready = true;
              debug("ready msg accepted.");
              if (type === "ping") {
                obj.notify({ method: "__ready", params: "pong" });
              }
              while (pendingQueue.length) {
                postMessage(pendingQueue.pop());
              }
              if (typeof cfg.onReady === "function")
                cfg.onReady(obj);
            };
            var obj = {
              unbind: function(method) {
                if (regTbl[method]) {
                  if (!delete regTbl[method])
                    throw "can't delete method: " + method;
                  return true;
                }
                return false;
              },
              bind: function(method, cb) {
                if (!method || typeof method !== "string")
                  throw "'method' argument to bind must be string";
                if (!cb || typeof cb !== "function")
                  throw "callback missing from bind params";
                if (regTbl[method])
                  throw "method '" + method + "' is already bound!";
                regTbl[method] = cb;
                return this;
              },
              call: function(m) {
                if (!m)
                  throw "missing arguments to call function";
                if (!m.method || typeof m.method !== "string")
                  throw "'method' argument to call must be string";
                if (!m.success || typeof m.success !== "function")
                  throw "'success' callback missing from call";
                var callbacks = {};
                var callbackNames = [];
                var seen = [];
                var pruneFunctions = function(path, obj2) {
                  if (seen.indexOf(obj2) >= 0) {
                    throw "params cannot be a recursive data structure";
                  }
                  seen.push(obj2);
                  if (typeof obj2 === "object") {
                    for (var k in obj2) {
                      if (!obj2.hasOwnProperty(k))
                        continue;
                      var np = path + (path.length ? "/" : "") + k;
                      if (typeof obj2[k] === "function") {
                        callbacks[np] = obj2[k];
                        callbackNames.push(np);
                        delete obj2[k];
                      } else if (typeof obj2[k] === "object" && obj2[k] !== null) {
                        pruneFunctions(np, obj2[k]);
                      }
                    }
                  }
                };
                pruneFunctions("", m.params);
                var msg = { id: s_curTranId, method: scopeMethod(m.method), params: m.params };
                if (callbackNames.length)
                  msg.callbacks = callbackNames;
                if (m.timeout)
                  setTransactionTimeout(s_curTranId, m.timeout, scopeMethod(m.method));
                outTbl[s_curTranId] = { callbacks, error: m.error, success: m.success };
                s_transIds[s_curTranId] = onMessage;
                s_curTranId++;
                postMessage(msg);
              },
              notify: function(m) {
                if (!m)
                  throw "missing arguments to notify function";
                if (!m.method || typeof m.method !== "string")
                  throw "'method' argument to notify must be string";
                postMessage({ method: scopeMethod(m.method), params: m.params });
              },
              destroy: function() {
                s_removeBoundChan(cfg.window, cfg.origin, typeof cfg.scope === "string" ? cfg.scope : "");
                if (window.removeEventListener)
                  window.removeEventListener("message", onMessage, false);
                else if (window.detachEvent)
                  window.detachEvent("onmessage", onMessage);
                ready = false;
                regTbl = {};
                inTbl = {};
                outTbl = {};
                cfg.origin = null;
                pendingQueue = [];
                debug("channel destroyed");
                chanId = "";
              }
            };
            obj.bind("__ready", onReady);
            setTimeout(function() {
              postMessage({ method: scopeMethod("__ready"), params: "ping" }, true);
            }, 0);
            return obj;
          }
        };
      }();
      if (typeof module !== "undefined") {
        module.exports = Channel2;
      }
    }
  });

  // src/js/shared/config.js
  var env = {
    isDevMode: false,
    botURL: "http://localhost:4200",
    cssURL: "http://localhost:4200/assets/css/embed.css"
  };

  // src/js/shared/helper.js
  function toggleChatBox(isChatOpen, iframe) {
    console.log(isChatOpen);
    iframe.classList.remove("isChatOpen");
    iframe.classList.remove("isChatClose");
    var className = isChatOpen ? "isChatOpen" : "isChatClose";
    iframe.classList.add(className);
  }
  function addStyleSheet(fileName, cb) {
    var head = document.head;
    var link = document.createElement("link");
    link.type = "text/css";
    link.rel = "stylesheet";
    link.href = fileName;
    if (cb) {
      style.onload = cb;
    }
    head.appendChild(link);
  }
  function urlProperty(url, field) {
    if (url) {
      var el = document.createElement("a");
      el.href = url;
      return el[field];
    }
    return "";
  }

  // src/js/embed/channel-child.js
  var import_js_channel = __toModule(require_jschannel());

  // src/js/shared/useragent.js
  var visitor = function() {
    "use strict";
    var UserAgent = function() {
      this.version = "1.0.15";
      this._Versions = {
        Edge: /(?:edge|edga|edgios|edg)\/([\d\w\.\-]+)/i,
        Firefox: /(?:firefox|fxios)\/([\d\w\.\-]+)/i,
        IE: /msie\s([\d\.]+[\d])|trident\/\d+\.\d+;.*[rv:]+(\d+\.\d)/i,
        Chrome: /(?:chrome|crios)\/([\d\w\.\-]+)/i,
        Chromium: /chromium\/([\d\w\.\-]+)/i,
        Safari: /(version|safari)\/([\d\w\.\-]+)/i,
        Opera: /version\/([\d\w\.\-]+)|OPR\/([\d\w\.\-]+)/i,
        Ps3: /([\d\w\.\-]+)\)\s*$/i,
        Psp: /([\d\w\.\-]+)\)?\s*$/i,
        Amaya: /amaya\/([\d\w\.\-]+)/i,
        SeaMonkey: /seamonkey\/([\d\w\.\-]+)/i,
        OmniWeb: /omniweb\/v([\d\w\.\-]+)/i,
        Flock: /flock\/([\d\w\.\-]+)/i,
        Epiphany: /epiphany\/([\d\w\.\-]+)/i,
        WinJs: /msapphost\/([\d\w\.\-]+)/i,
        PhantomJS: /phantomjs\/([\d\w\.\-]+)/i,
        AlamoFire: /alamofire\/([\d\w\.\-]+)/i,
        UC: /ucbrowser\/([\d\w\.]+)/i,
        Facebook: /FBAV\/([\d\w\.]+)/i,
        WebKit: /applewebkit\/([\d\w\.]+)/i,
        Wechat: /micromessenger\/([\d\w\.]+)/i,
        Electron: /Electron\/([\d\w\.]+)/i
      };
      this._Browsers = {
        YaBrowser: /yabrowser/i,
        Edge: /edge|edga|edgios|edg/i,
        Amaya: /amaya/i,
        Konqueror: /konqueror/i,
        Epiphany: /epiphany/i,
        SeaMonkey: /seamonkey/i,
        Flock: /flock/i,
        OmniWeb: /omniweb/i,
        Chromium: /chromium/i,
        Chrome: /chrome|crios/i,
        Safari: /safari/i,
        IE: /msie|trident/i,
        Opera: /opera|OPR\//i,
        PS3: /playstation 3/i,
        PSP: /playstation portable/i,
        Firefox: /firefox|fxios/i,
        WinJs: /msapphost/i,
        PhantomJS: /phantomjs/i,
        AlamoFire: /alamofire/i,
        UC: /UCBrowser/i,
        Facebook: /FBA[NV]/
      };
      this._OS = {
        Windows10: /windows nt 10\.0/i,
        Windows81: /windows nt 6\.3/i,
        Windows8: /windows nt 6\.2/i,
        Windows7: /windows nt 6\.1/i,
        UnknownWindows: /windows nt 6\.\d+/i,
        WindowsVista: /windows nt 6\.0/i,
        Windows2003: /windows nt 5\.2/i,
        WindowsXP: /windows nt 5\.1/i,
        Windows2000: /windows nt 5\.0/i,
        WindowsPhone81: /windows phone 8\.1/i,
        WindowsPhone80: /windows phone 8\.0/i,
        OSXCheetah: /os x 10[._]0/i,
        OSXPuma: /os x 10[._]1(\D|$)/i,
        OSXJaguar: /os x 10[._]2/i,
        OSXPanther: /os x 10[._]3/i,
        OSXTiger: /os x 10[._]4/i,
        OSXLeopard: /os x 10[._]5/i,
        OSXSnowLeopard: /os x 10[._]6/i,
        OSXLion: /os x 10[._]7/i,
        OSXMountainLion: /os x 10[._]8/i,
        OSXMavericks: /os x 10[._]9/i,
        OSXYosemite: /os x 10[._]10/i,
        OSXElCapitan: /os x 10[._]11/i,
        MacOSSierra: /os x 10[._]12/i,
        MacOSHighSierra: /os x 10[._]13/i,
        MacOSMojave: /os x 10[._]14/i,
        Mac: /os x/i,
        Linux: /linux/i,
        Linux64: /linux x86\_64/i,
        ChromeOS: /cros/i,
        Wii: /wii/i,
        PS3: /playstation 3/i,
        PSP: /playstation portable/i,
        iPad: /\(iPad.*os (\d+)[._](\d+)/i,
        iPhone: /\(iPhone.*os (\d+)[._](\d+)/i,
        iOS: /ios/i,
        Bada: /Bada\/(\d+)\.(\d+)/i,
        Curl: /curl\/(\d+)\.(\d+)\.(\d+)/i,
        Electron: /Electron\/(\d+)\.(\d+)\.(\d+)/i
      };
      this._Platform = {
        Windows: /windows nt/i,
        WindowsPhone: /windows phone/i,
        Mac: /macintosh/i,
        Linux: /linux/i,
        Wii: /wii/i,
        Playstation: /playstation/i,
        iPad: /ipad/i,
        iPod: /ipod/i,
        iPhone: /iphone/i,
        Android: /android/i,
        Blackberry: /blackberry/i,
        Samsung: /samsung/i,
        Curl: /curl/i,
        Electron: /Electron/i,
        iOS: /^ios\-/i
      };
      this.DefaultAgent = {
        isYaBrowser: false,
        isAuthoritative: true,
        isMobile: false,
        isMobileNative: false,
        isTablet: false,
        isiPad: false,
        isiPod: false,
        isiPhone: false,
        isiPhoneNative: false,
        isAndroid: false,
        isAndroidNative: false,
        isBlackberry: false,
        isOpera: false,
        isIE: false,
        isEdge: false,
        isIECompatibilityMode: false,
        isSafari: false,
        isFirefox: false,
        isWebkit: false,
        isChrome: false,
        isKonqueror: false,
        isOmniWeb: false,
        isSeaMonkey: false,
        isFlock: false,
        isAmaya: false,
        isPhantomJS: false,
        isEpiphany: false,
        isDesktop: false,
        isWindows: false,
        isLinux: false,
        isLinux64: false,
        isMac: false,
        isChromeOS: false,
        isBada: false,
        isSamsung: false,
        isRaspberry: false,
        isBot: false,
        isCurl: false,
        isAndroidTablet: false,
        isWinJs: false,
        isKindleFire: false,
        isSilk: false,
        isCaptive: false,
        isSmartTV: false,
        isUC: false,
        isFacebook: false,
        isAlamoFire: false,
        isElectron: false,
        silkAccelerated: false,
        browser: "unknown",
        version: "unknown",
        os: "unknown",
        platform: "unknown",
        geoIp: {},
        source: "",
        isWechat: false
      };
      this.Agent = {};
      this.getBrowser = function(string) {
        switch (true) {
          case this._Browsers.YaBrowser.test(string):
            this.Agent.isYaBrowser = true;
            return "YaBrowser";
          case this._Browsers.AlamoFire.test(string):
            this.Agent.isAlamoFire = true;
            return "AlamoFire";
          case this._Browsers.Edge.test(string):
            this.Agent.isEdge = true;
            return "Edge";
          case this._Browsers.PhantomJS.test(string):
            this.Agent.isPhantomJS = true;
            return "PhantomJS";
          case this._Browsers.Konqueror.test(string):
            this.Agent.isKonqueror = true;
            return "Konqueror";
          case this._Browsers.Amaya.test(string):
            this.Agent.isAmaya = true;
            return "Amaya";
          case this._Browsers.Epiphany.test(string):
            this.Agent.isEpiphany = true;
            return "Epiphany";
          case this._Browsers.SeaMonkey.test(string):
            this.Agent.isSeaMonkey = true;
            return "SeaMonkey";
          case this._Browsers.Flock.test(string):
            this.Agent.isFlock = true;
            return "Flock";
          case this._Browsers.OmniWeb.test(string):
            this.Agent.isOmniWeb = true;
            return "OmniWeb";
          case this._Browsers.Opera.test(string):
            this.Agent.isOpera = true;
            return "Opera";
          case this._Browsers.Chromium.test(string):
            this.Agent.isChrome = true;
            return "Chromium";
          case this._Browsers.Facebook.test(string):
            this.Agent.isFacebook = true;
            return "Facebook";
          case this._Browsers.Chrome.test(string):
            this.Agent.isChrome = true;
            return "Chrome";
          case this._Browsers.WinJs.test(string):
            this.Agent.isWinJs = true;
            return "WinJs";
          case this._Browsers.IE.test(string):
            this.Agent.isIE = true;
            return "IE";
          case this._Browsers.Firefox.test(string):
            this.Agent.isFirefox = true;
            return "Firefox";
          case this._Browsers.Safari.test(string):
            this.Agent.isSafari = true;
            return "Safari";
          case this._Browsers.PS3.test(string):
            return "ps3";
          case this._Browsers.PSP.test(string):
            return "psp";
          case this._Browsers.UC.test(string):
            this.Agent.isUC = true;
            return "UCBrowser";
          default:
            if (string.indexOf("Dalvik") !== -1) {
              return "unknown";
            }
            if (string.indexOf("Mozilla") !== 0 && /^([\d\w\-\.]+)\/[\d\w\.\-]+/i.test(string)) {
              this.Agent.isAuthoritative = false;
              return RegExp.$1;
            }
            return "unknown";
        }
      };
      this.getBrowserVersion = function(string) {
        var regex;
        switch (this.Agent.browser) {
          case "Edge":
            if (this._Versions.Edge.test(string)) {
              return RegExp.$1;
            }
            break;
          case "PhantomJS":
            if (this._Versions.PhantomJS.test(string)) {
              return RegExp.$1;
            }
            break;
          case "Chrome":
            if (this._Versions.Chrome.test(string)) {
              return RegExp.$1;
            }
            break;
          case "Chromium":
            if (this._Versions.Chromium.test(string)) {
              return RegExp.$1;
            }
            break;
          case "Safari":
            if (this._Versions.Safari.test(string)) {
              return RegExp.$2;
            }
            break;
          case "Opera":
            if (this._Versions.Opera.test(string)) {
              return RegExp.$1 ? RegExp.$1 : RegExp.$2;
            }
            break;
          case "Firefox":
            if (this._Versions.Firefox.test(string)) {
              return RegExp.$1;
            }
            break;
          case "WinJs":
            if (this._Versions.WinJs.test(string)) {
              return RegExp.$1;
            }
            break;
          case "IE":
            if (this._Versions.IE.test(string)) {
              return RegExp.$2 ? RegExp.$2 : RegExp.$1;
            }
            break;
          case "ps3":
            if (this._Versions.Ps3.test(string)) {
              return RegExp.$1;
            }
            break;
          case "psp":
            if (this._Versions.Psp.test(string)) {
              return RegExp.$1;
            }
            break;
          case "Amaya":
            if (this._Versions.Amaya.test(string)) {
              return RegExp.$1;
            }
            break;
          case "Epiphany":
            if (this._Versions.Epiphany.test(string)) {
              return RegExp.$1;
            }
            break;
          case "SeaMonkey":
            if (this._Versions.SeaMonkey.test(string)) {
              return RegExp.$1;
            }
            break;
          case "Flock":
            if (this._Versions.Flock.test(string)) {
              return RegExp.$1;
            }
            break;
          case "OmniWeb":
            if (this._Versions.OmniWeb.test(string)) {
              return RegExp.$1;
            }
            break;
          case "UCBrowser":
            if (this._Versions.UC.test(string)) {
              return RegExp.$1;
            }
            break;
          case "Facebook":
            if (this._Versions.Facebook.test(string)) {
              return RegExp.$1;
            }
            break;
          default:
            if (this.Agent.browser !== "unknown") {
              regex = new RegExp(this.Agent.browser + "[\\/ ]([\\d\\w\\.\\-]+)", "i");
              if (regex.test(string)) {
                return RegExp.$1;
              }
            } else {
              this.testWebkit();
              if (this.Agent.isWebkit && this._Versions.WebKit.test(string)) {
                return RegExp.$1;
              }
              return "unknown";
            }
        }
      };
      this.getOS = function(string) {
        switch (true) {
          case this._OS.WindowsVista.test(string):
            this.Agent.isWindows = true;
            return "Windows Vista";
          case this._OS.Windows7.test(string):
            this.Agent.isWindows = true;
            return "Windows 7";
          case this._OS.Windows8.test(string):
            this.Agent.isWindows = true;
            return "Windows 8";
          case this._OS.Windows81.test(string):
            this.Agent.isWindows = true;
            return "Windows 8.1";
          case this._OS.Windows10.test(string):
            this.Agent.isWindows = true;
            return "Windows 10.0";
          case this._OS.Windows2003.test(string):
            this.Agent.isWindows = true;
            return "Windows 2003";
          case this._OS.WindowsXP.test(string):
            this.Agent.isWindows = true;
            return "Windows XP";
          case this._OS.Windows2000.test(string):
            this.Agent.isWindows = true;
            return "Windows 2000";
          case this._OS.WindowsPhone81.test(string):
            this.Agent.isWindowsPhone = true;
            return "Windows Phone 8.1";
          case this._OS.WindowsPhone80.test(string):
            this.Agent.isWindowsPhone = true;
            return "Windows Phone 8.0";
          case this._OS.Linux64.test(string):
            this.Agent.isLinux = true;
            this.Agent.isLinux64 = true;
            return "Linux 64";
          case this._OS.Linux.test(string):
            this.Agent.isLinux = true;
            return "Linux";
          case this._OS.ChromeOS.test(string):
            this.Agent.isChromeOS = true;
            return "Chrome OS";
          case this._OS.Wii.test(string):
            return "Wii";
          case this._OS.PS3.test(string):
            return "Playstation";
          case this._OS.PSP.test(string):
            return "Playstation";
          case this._OS.OSXCheetah.test(string):
            this.Agent.isMac = true;
            return "OS X Cheetah";
          case this._OS.OSXPuma.test(string):
            this.Agent.isMac = true;
            return "OS X Puma";
          case this._OS.OSXJaguar.test(string):
            this.Agent.isMac = true;
            return "OS X Jaguar";
          case this._OS.OSXPanther.test(string):
            this.Agent.isMac = true;
            return "OS X Panther";
          case this._OS.OSXTiger.test(string):
            this.Agent.isMac = true;
            return "OS X Tiger";
          case this._OS.OSXLeopard.test(string):
            this.Agent.isMac = true;
            return "OS X Leopard";
          case this._OS.OSXSnowLeopard.test(string):
            this.Agent.isMac = true;
            return "OS X Snow Leopard";
          case this._OS.OSXLion.test(string):
            this.Agent.isMac = true;
            return "OS X Lion";
          case this._OS.OSXMountainLion.test(string):
            this.Agent.isMac = true;
            return "OS X Mountain Lion";
          case this._OS.OSXMavericks.test(string):
            this.Agent.isMac = true;
            return "OS X Mavericks";
          case this._OS.OSXYosemite.test(string):
            this.Agent.isMac = true;
            return "OS X Yosemite";
          case this._OS.OSXElCapitan.test(string):
            this.Agent.isMac = true;
            return "OS X El Capitan";
          case this._OS.MacOSSierra.test(string):
            this.Agent.isMac = true;
            return "macOS Sierra";
          case this._OS.MacOSHighSierra.test(string):
            this.Agent.isMac = true;
            return "macOS High Sierra";
          case this._OS.MacOSMojave.test(string):
            this.Agent.isMac = true;
            return "macOS Mojave";
          case this._OS.Mac.test(string):
            this.Agent.isMac = true;
            return "OS X";
          case this._OS.iPad.test(string):
            this.Agent.isiPad = true;
            return string.match(this._OS.iPad)[0].replace("_", ".");
          case this._OS.iPhone.test(string):
            this.Agent.isiPhone = true;
            return string.match(this._OS.iPhone)[0].replace("_", ".");
          case this._OS.Bada.test(string):
            this.Agent.isBada = true;
            return "Bada";
          case this._OS.Curl.test(string):
            this.Agent.isCurl = true;
            return "Curl";
          case this._OS.iOS.test(string):
            this.Agent.isiPhone = true;
            return "iOS";
          case this._OS.Electron.test(string):
            this.Agent.isElectron = true;
            return "Electron";
          default:
            return "unknown";
        }
      };
      this.getPlatform = function(string) {
        switch (true) {
          case this._Platform.Windows.test(string):
            return "Microsoft Windows";
          case this._Platform.WindowsPhone.test(string):
            this.Agent.isWindowsPhone = true;
            return "Microsoft Windows Phone";
          case this._Platform.Mac.test(string):
            return "Apple Mac";
          case this._Platform.Curl.test(string):
            return "Curl";
          case this._Platform.Electron.test(string):
            this.Agent.isElectron = true;
            return "Electron";
          case this._Platform.Android.test(string):
            this.Agent.isAndroid = true;
            return "Android";
          case this._Platform.Blackberry.test(string):
            this.Agent.isBlackberry = true;
            return "Blackberry";
          case this._Platform.Linux.test(string):
            return "Linux";
          case this._Platform.Wii.test(string):
            return "Wii";
          case this._Platform.Playstation.test(string):
            return "Playstation";
          case this._Platform.iPad.test(string):
            this.Agent.isiPad = true;
            return "iPad";
          case this._Platform.iPod.test(string):
            this.Agent.isiPod = true;
            return "iPod";
          case this._Platform.iPhone.test(string):
            this.Agent.isiPhone = true;
            return "iPhone";
          case this._Platform.Samsung.test(string):
            this.Agent.isSamsung = true;
            return "Samsung";
          case this._Platform.iOS.test(string):
            return "Apple iOS";
          default:
            return "unknown";
        }
      };
      this.testMobile = function testMobile() {
        var ua = this;
        switch (true) {
          case ua.Agent.isWindows:
          case ua.Agent.isLinux:
          case ua.Agent.isMac:
          case ua.Agent.isChromeOS:
            ua.Agent.isDesktop = true;
            break;
          case ua.Agent.isAndroid:
          case ua.Agent.isSamsung:
            ua.Agent.isMobile = true;
            break;
          default:
        }
        switch (true) {
          case ua.Agent.isiPad:
          case ua.Agent.isiPod:
          case ua.Agent.isiPhone:
          case ua.Agent.isBada:
          case ua.Agent.isBlackberry:
          case ua.Agent.isAndroid:
          case ua.Agent.isWindowsPhone:
            ua.Agent.isMobile = true;
            ua.Agent.isDesktop = false;
            break;
          default:
        }
        if (/mobile|^ios\-/i.test(ua.Agent.source)) {
          ua.Agent.isMobile = true;
          ua.Agent.isDesktop = false;
        }
        if (/dalvik/i.test(ua.Agent.source)) {
          ua.Agent.isAndroidNative = true;
          ua.Agent.isMobileNative = true;
        }
        if (/scale/i.test(ua.Agent.source)) {
          ua.Agent.isiPhoneNative = true;
          ua.Agent.isMobileNative = true;
        }
      };
      this.parse = function parse(source) {
        var ua = new UserAgent();
        ua.Agent.source = source.replace(/^\s*/, "").replace(/\s*$/, "");
        ua.Agent.os = ua.getOS(ua.Agent.source);
        ua.Agent.platform = ua.getPlatform(ua.Agent.source);
        ua.Agent.browser = ua.getBrowser(ua.Agent.source);
        ua.Agent.browserVersion = ua.getBrowserVersion(ua.Agent.source);
        ua.testMobile();
        return ua.Agent;
      };
      this.Agent = this.DefaultAgent;
      return this;
    };
    var userAgent = new UserAgent().parse(navigator.userAgent);
    var visitor2 = {};
    visitor2.isMobile = userAgent.isMobile;
    visitor2.device = userAgent.isMobile ? "mobile" : "desktop";
    visitor2.browser = userAgent.browser;
    visitor2.browserVersion = userAgent.browserVersion;
    visitor2.operatingSystem = userAgent.os;
    visitor2.platform = userAgent.platform;
    visitor2.userAgent = userAgent.source;
    visitor2.language = navigator.language;
    visitor2.session = visitor2.session || {};
    visitor2.session.href = window.location.href.replace(/\/+$/, "");
    visitor2.session.httpHost = location.hostname;
    visitor2.session.requestUri = location.pathname + location.search;
    visitor2.session.refererHttpHost = urlProperty(document.referrer, "hostname");
    visitor2.session.refererRequestUri = urlProperty(document.referrer, "pathname");
    visitor2.session.referrer = document.referrer;
    return visitor2;
  }();

  // src/js/embed/channel-child.js
  var channelChild = function() {
    if (true) {
      var chan = null;
      var resolve;
      var promise = new Promise(function(res, rej) {
        resolve = res;
      });
      var onload = function() {
        chan = import_js_channel.default.build({
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
        iframe.addEventListener("load", function() {
          onload();
        }, false);
      } else if (iframe.attachEvent) {
        iframe.attachEvent("onload", function() {
          onload();
        }, false);
      }
      iframe.src = env.botURL;
    }
    function initBind() {
      chan.bind("toggleChatBox", function(t, s) {
        toggleChatBox(s, iframe);
      });
      console.log(visitor);
      chan.bind("getVisitorInfo", function(t, s) {
        return visitor;
      });
    }
    return {
      iframe,
      promise,
      reverse: function() {
        chan.call({
          method: "reverse",
          params: "hello world! outer world",
          success: function(v) {
            console.log(1, "function returns: '" + v + "'");
          }
        });
      }
    };
  }();

  // src/js/embed/index.js
  addStyleSheet(env.cssURL);
})();
