(()=>{var e={3956:(e,n,t)=>{"use strict";t.r(n),t.d(n,{default:()=>h});var o=t(9439),r=t(9526),s=t(5967),a=t(9950),i=t(6016),c=(t(7132),t(3859)),u=t(5648),l=t(1133),f=t(9233),d=t(5693),p=t(7557);function h(){var e={path:"expo-AzureAD",scheme:"azuread"},n={clientId:"a26fba9c-c752-4af1-8be4-ba80d2a4d36e",scopes:["openid","profile","email","offline_access"],responseType:i.ResponseType.IdToken,extraParams:{nonce:"nonce"},redirectUri:(0,i.makeRedirectUri)(e)},t=(0,i.useAutoDiscovery)("https://login.microsoftonline.com/a0225615-7f89-4786-a96e-2bd64c8db5c7/v2.0");r.useEffect((function(){t&&U()}),[t]);var s=(0,i.useAuthRequest)(n,t),c=(0,o.default)(s,3),h=c[0],m=c[1],v=c[2];r.useEffect((function(){if(m)if(console.log("response changed => type:",m.type),"success"===m.type){var e=i.TokenResponse.fromQueryParams(m.params);m.params.access_token;j(e.idToken).then((function(e){b.current=e,C(!1)})).catch((function(e){return console.log("iNetLogin() failed:",e)}))}else"error"===m.type&&console.log(m)}),[m]),r.useEffect((function(){console.log("App mount"),a.addEventListener("url",(function(e){console.log("capture navigate:",e.url)}))}),[]);a.useURL();var b=r.useRef(),g=r.useState({}),y=(0,o.default)(g,2),k=y[0],S=y[1],T="https://devuccontroller.ucconnect.de",w="ws0021.local",P=[],j=function(e){var n;return console.assert(e.length,"missing parameter: sToken"),fetch(T+"/controller/client/ucws?ucsid="+w).then((function(e){return e.json()})).then((function(t){n=t.redirect;var o={method:"POST",headers:{"Content-Type":"application/json",Authorization:"JWT "+e,"X-EPID":w,"X-UCSID":w},body:JSON.stringify({negotiate:{iClientProtocolVersion:70}})};return fetch(n+"/ws/client/createsession?clientappid=9",o)})).then((function(e){return e.json()})).then((function(e){S(e);var t=(n+"/ws/client/websocket?x-ucsessionid="+e.sessionid).replace("https://","wss://").replace("http://","ws://");return new Promise((function(e,n){var o=new WebSocket(t);o.addEventListener("open",(function(n){return e(o)}))}))}))},A=function(){var e=Math.random().toString().substr(2,9);return parseInt(e)},x=function(e,n,t,o){var r={invoke:{invokeID:A(),operationName:"asn"+e}},s={fnFulfilled:"function"===typeof t?t:null,fnRejected:"function"===typeof o?o:null};r.invoke.argument=n,r.invoke.argument._type="Asn"+e+"Argument",P[r.invoke.invokeID]=s,b.current.send(window.JSON.stringify(r))},R=r.useState(!0),O=(0,o.default)(R,2),I=O[0],C=O[1],U=function(){console.assert(t,"invalid state/environment: discoveryDoc"),function(n){var o={clientId:"a26fba9c-c752-4af1-8be4-ba80d2a4d36e",scopes:["openid","profile","email","offline_access"],responseType:i.ResponseType.IdToken,extraParams:{nonce:"nonce"},prompt:n,redirectUri:(0,i.makeRedirectUri)(e)};return new i.AuthRequest(o).promptAsync(t)}(i.Prompt.None).then((function(e){if(console.log("AuthSessionResult.type:",e.type),"success"!==e.type)throw new Error(e.error.message);var n=i.TokenResponse.fromQueryParams(e.params);return console.log("idToken:",n.idToken),j(n.idToken)})).then((function(e){b.current=e,console.log("LoggedIn! (authenticated, connected and WebSocket establish'ed)"),C(!1)})).catch((function(e){return console.log("checkNoUserInteraction() failed:",e)}))};return(0,p.jsxs)(l.default,{children:[(0,p.jsxs)(f.default,{children:["URL: ",a.createURL("")]}),(0,p.jsx)(d.default,{disabled:!h||!I,title:"Login",onPress:function(e){v().then((function(e){i.TokenResponse.fromQueryParams(e.params)})).catch((function(e){console.log("exception:",e)}))}}),(0,p.jsx)(d.default,{disabled:!t,title:"Logout",onPress:function(e){a.openURL(t.endSessionEndpoint)}}),(0,p.jsx)(d.default,{disable:!k,title:"Available",onPress:function(e){!function(){if(WebSocket.OPEN===b.current.readyState){var e={absentstate:{u8sContactId:k.ownContact.u8sContactId,u8sUsername:"",stTimeFrom:"",stTimeTo:"",iAbsentState:0,u8sMessage:"",u8sAbsentReason:"",iPresenceState:0}};x("AbsentStateSetUser",e)}}()}}),(0,p.jsx)(d.default,{disable:!k,title:"Absent",onPress:function(e){!function(){var e={absentstate:{u8sContactId:k.ownContact.u8sContactId,u8sUsername:"",stTimeFrom:"",stTimeTo:"",iAbsentState:1,u8sMessage:"",u8sAbsentReason:"",iPresenceState:0}};x("AbsentStateSetUser",e)}()}}),(0,p.jsx)(u.default,{})]})}s.maybeCompleteAuthSession();c.default.create({container:{flex:1,backgroundColor:"#fff",alignItems:"center",justifyContent:"center"}})},4654:()=>{}},n={};function t(o){var r=n[o];if(void 0!==r)return r.exports;var s=n[o]={id:o,loaded:!1,exports:{}};return e[o].call(s.exports,s,s.exports,t),s.loaded=!0,s.exports}t.m=e,(()=>{var e=[];t.O=(n,o,r,s)=>{if(!o){var a=1/0;for(l=0;l<e.length;l++){for(var[o,r,s]=e[l],i=!0,c=0;c<o.length;c++)(!1&s||a>=s)&&Object.keys(t.O).every((e=>t.O[e](o[c])))?o.splice(c--,1):(i=!1,s<a&&(a=s));if(i){e.splice(l--,1);var u=r();void 0!==u&&(n=u)}}return n}s=s||0;for(var l=e.length;l>0&&e[l-1][2]>s;l--)e[l]=e[l-1];e[l]=[o,r,s]}})(),t.n=e=>{var n=e&&e.__esModule?()=>e.default:()=>e;return t.d(n,{a:n}),n},t.d=(e,n)=>{for(var o in n)t.o(n,o)&&!t.o(e,o)&&Object.defineProperty(e,o,{enumerable:!0,get:n[o]})},t.g=function(){if("object"===typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"===typeof window)return window}}(),t.o=(e,n)=>Object.prototype.hasOwnProperty.call(e,n),t.r=e=>{"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},t.nmd=e=>(e.paths=[],e.children||(e.children=[]),e),(()=>{var e={179:0};t.O.j=n=>0===e[n];var n=(n,o)=>{var r,s,[a,i,c]=o,u=0;if(a.some((n=>0!==e[n]))){for(r in i)t.o(i,r)&&(t.m[r]=i[r]);if(c)var l=c(t)}for(n&&n(o);u<a.length;u++)s=a[u],t.o(e,s)&&e[s]&&e[s][0](),e[s]=0;return t.O(l)},o=self.webpackChunkweb=self.webpackChunkweb||[];o.forEach(n.bind(null,0)),o.push=n.bind(null,o.push.bind(o))})();var o=t.O(void 0,[801],(()=>t(9484)));o=t.O(o)})();
//# sourceMappingURL=main.2031985c.js.map