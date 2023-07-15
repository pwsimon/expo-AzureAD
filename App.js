import * as React from 'react';
import * as WebBrowser from 'expo-web-browser'; // [Expo WebBrowser](https://docs.expo.dev/versions/latest/sdk/webbrowser/)
import * as Linking from 'expo-linking';
import {
		useAuthRequest, // [Hooks](https://docs.expo.dev/versions/latest/sdk/auth-session/#hooks)
		useAutoDiscovery,
		makeRedirectUri, // (static) [Methods](https://docs.expo.dev/versions/latest/sdk/auth-session/#methods)
		exchangeCodeAsync,
		startAsync,
		TokenResponse, // [Classes](https://docs.expo.dev/versions/latest/sdk/auth-session/#classes)
		AuthRequest,
		ResponseType, // [Types](https://docs.expo.dev/versions/latest/sdk/auth-session/#types)
		Prompt
	} from 'expo-auth-session'; // [Expo AuthSession](https://docs.expo.dev/versions/latest/sdk/auth-session/)
import {
	Platform,
	StyleSheet,
	StatusBar,
	View,
	Text,
	Button } from 'react-native';

// das funktioniert nur ...
// The method should be invoked on the page that the window redirects to.
WebBrowser.maybeCompleteAuthSession();

export default function App() {
	/*
	* (AuthSession.makeRedirectUri)[https://docs.expo.dev/versions/latest/sdk/auth-session/#authsessionmakeredirecturioptions]
	* wir brauchen je nach start-modus (Development, Productive) mehrere RedirectUri's im AzurePortal
	* Development: http://localhost:19006/expo-AzureAD
	* Productive: https://pwsimon.github.io/expo-AzureAD
	*/
	const makeRedirectUriOptions = {
			path: 'expo-AzureAD', // der RedirectUri im AzurePortal: https://pwsimon.github.io/expo-AzureAD
			scheme: 'azuread' // https://docs.expo.dev/versions/latest/config/app/#scheme
		};
	const requestConfig = { // interface [AuthRequestConfig](https://docs.expo.dev/versions/latest/sdk/auth-session/#authrequestconfig)
			clientId: 'a26fba9c-c752-4af1-8be4-ba80d2a4d36e',
			scopes: ['openid', 'profile', 'email', 'offline_access'],
			responseType: ResponseType.IdToken, // https://docs.expo.dev/versions/latest/sdk/auth-session/#idtoken
			extraParams: { nonce: "nonce" }, // https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type
			// prompt: Prompt.None, // login check
			redirectUri: makeRedirectUri(makeRedirectUriOptions)
		}

	/*
	* wir brauchen das: discoveryDoc an drei stellen.
	* 1.) fuer das: authenticate/promptAsync() Prompt.Login
	* 2.) fuer das: authenticate/getIdTokenAsync() Prompt.None
	* 3.) fuer das: logoff()
	* interface [DiscoveryDocument](https://docs.expo.dev/versions/latest/sdk/auth-session/#discoverydocument)
	*/
	const discoveryDoc = useAutoDiscovery('https://login.microsoftonline.com/a0225615-7f89-4786-a96e-2bd64c8db5c7/v2.0'); // Endpoint
	React.useEffect(() => {
/*
* getriggert wird das fetch durch den: useAutoDiscovery Hook
* console.log("discoveryDoc changed");
*/
			checkNoUserInteraction();
		}, [discoveryDoc]);

	const [
			request, // [Class AuthRequest](https://docs.expo.dev/versions/latest/sdk/auth-session/#authrequest)
			response, // [Type AuthSessionResult](https://docs.expo.dev/versions/latest/sdk/auth-session/#authsessionresult)
			promptAsync
		] = useAuthRequest(requestConfig, discoveryDoc);

	/*
	* typischerweise erkennen wir das resolve/reject der Async Function: promptAsync()
	* durch ein: useEffect(, [response])
	* siehe auch: promptAsync.then()
	*/
	React.useEffect(() => {
			if (!response) return;
			console.log("response changed => type:", response.type);
			if ('success' === response.type) {
				const oTR = TokenResponse.fromQueryParams(response.params),
					token = response.params.access_token;

				iNetTokenVerify(oTR.idToken);
				// iNetLogin(oTR.idToken);
			} else if ('error' === response.type) {
				console.log(response);
			}
		}, [response]);

	/*
	* das ist die "kleine" version von ReactRouter (Navigate)
	* wir fangen und behandeln mit dem "addEventListener("url", ...") die Navigation
	*/
	React.useEffect(() => {
/*
* [Linking.addEventListener(type, handler)](https://docs.expo.dev/versions/latest/sdk/linking/#linkingaddeventlistenertype-handler)
* [EventType](https://docs.expo.dev/versions/latest/sdk/linking/#eventtype)
*/
		console.log("App mount");
		Linking.addEventListener("url", (e) => {
/*
* typisch an dieser stelle ein: xxx://yyy/authRedirect
* z.B. http://localhost:19006/authRedirect?id_token=hurts
* z.B. exp://10.20.4.63:19000/--/authRedirect?id_token=hurts
*/
			console.log("capture navigate:", e.url);
		});
	},
	[]); // https://react.dev/reference/react/useEffect#examples-dependencies

	/*
	* [useURL](https://docs.expo.dev/versions/latest/sdk/linking/#useurl)
	* [Handling links](https://docs.expo.dev/guides/linking/#handling-links)
	*
	* [uri-scheme](https://github.com/expo/expo-cli)
	* Expo Go in Development (adjust the '127.0.0.1:19000' to match your dev server URL)
	*
	*     npx uri-scheme open exp://192.168.178.41:19000/--/somepath/into/app?hello=world --ios // pshome
	*     npx uri-scheme list
	*/
	const baseUrl =	Linking.useURL(); 

	const authenticate = () => {
		const promptOptions = null; // [AuthRequestPromptOptions](https://docs.expo.dev/versions/latest/sdk/auth-session/#authrequestpromptoptions)
		promptAsync(/*discoveryDoc, promptOptions*/)
			.then(authSessionResult => { // [Type AuthSessionResult](https://docs.expo.dev/versions/latest/sdk/auth-session/#authsessionresult)
					const oTR = TokenResponse.fromQueryParams(authSessionResult.params);
					// console.log("fullfilled => type:", authSessionResult.type);
				})
			.catch((e) => { console.log("exception:", e); });
	}
	const logoff = () => {
		// console.log("logoff()", discoveryDoc.endSessionEndpoint);
		Linking.openURL(discoveryDoc.endSessionEndpoint);
	}
/*
* using UCConnect needs: UCSID/Tenant (Mandant)
* folgende constellation:
* UCServer: \\ws0021\dev\procall_master (feature/PROCALL-3267-verifyJWT),
* [UCConnect Environment's](https://wiki.estos.de/display/DEV/Development+und+Staging+System)
* prod: "ws0021.local(riroyabihi)", https://portal.ucconnect.de,    https://uccontroller.ucconnect.de
* dev:  "ws0021.local(holamobequ)", https://devportal.ucconnect.de, https://devuccontroller.ucconnect.de
*   das: (dev) UCConnect ist eher zweite wahl (nicht stabil)
* AppServer: expo Development-Server, GitHub Pages
* Achtung!
* ein Login/CreateSession ist vermutlich einfacher denn:
* wg. verschaerfter CORS regeln im UCConnect darf ich keine header x-sessionid mehr schicken ...
*/
	const webSocket = React.useRef();
	const sUCControllerUrl = "https://devuccontroller.ucconnect.de";
	const sUCSID = "ws0021.local";
	const mapRR = [];
	const iNetTokenVerify = (sToken) => {
		fetch(`${sUCControllerUrl}/controller/client/ucws?ucsid=${sUCSID}`)
			.then(response => response.json())
			.then(oDiscover => {
				const oArgument = {
							_type: "AsnTokenVerifyArgument",
							sToken: sToken
						},
					oInit = {
							method: "POST",
							headers: {
								"Content-Type": "application/json",
								"x-ucsid": sUCSID
							},
							body: JSON.stringify(oArgument)
						};
					return fetch(`${oDiscover.redirect}/ws/direct/asnTokenVerify`, oInit)
				})
			.then(response => response.json())
			.then(oTokenVerifyResult => console.log(oTokenVerifyResult) )
			.catch(e =>  console.log("iNetTokenVerify() failed:", e));
	}
	const iNetLoginAsync = (sToken) => {
		var sOrigin;

		console.assert(sToken.length, "missing parameter: sToken");
		return fetch(`${sUCControllerUrl}/controller/client/ucws?ucsid=${sUCSID}`)
			.then(response => response.json())
			.then(oDiscover => {
					sOrigin = oDiscover.redirect;
					let oInit = {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
							Authorization: "JWT " + sToken,
							"X-EPID": sUCSID,
							"X-UCSID": sUCSID
						},
						body: JSON.stringify({ negotiate: { iClientProtocolVersion: 70 } }) // 61
					};
					return fetch(`${sOrigin}/ws/client/createsession?clientappid=9`, oInit)
				})
			.then(response => response.json())
			.then(oSession => {
					let sWSOrigin1 = sOrigin + "/ws/client/websocket?x-ucsessionid=" + oSession.sessionid,
						sWSOrigin2 = sWSOrigin1.replace("https://", "wss://"),
						sWSOrigin3 = sWSOrigin2.replace("http://", "ws://");

					return new Promise((resolve, reject) => {
							let webSocket = new WebSocket(sWSOrigin3);
							webSocket.addEventListener("open", event => resolve(webSocket));
						});
				});
	}
	const iNetLogin = (sToken) => {
		iNetLoginAsync(sToken)
			.then(oWebSocket => {
					webSocket.current = oWebSocket;
					const oArgument = {
							// _type: "AsnTokenVerifyArgument", // generated from: sOperation by wssSend
							sToken: sToken
						};
					wssSend("TokenVerify", oArgument);
				})
			.catch(e =>  console.log("iNetLogin() failed:", e));
	}
	const createInvokeID = () => {
		var sId = Math.random().toString().substr(2, 9);
		return parseInt(sId);
	}
	const wssSend = (sOperation, oArg, fnFulfilled, fnRejected) => {
		const oFrame = {
					invoke: {
						invokeID: createInvokeID(), // das ist die "InvokeID" um die antwort/response einem request zuzuordnen
						operationName: "asn" + sOperation
					}
				},
			oCBs = {
					fnFulfilled: "function" === typeof fnFulfilled ? fnFulfilled : null,
					fnRejected: "function" === typeof fnRejected ? fnRejected : null
				};
	
		oFrame.invoke.argument = oArg;
		oFrame.invoke.argument._type = 'Asn' + sOperation + 'Argument';
	
		mapRR[oFrame.invoke.invokeID] = oCBs;
		webSocket.current.send(window.JSON.stringify(oFrame));
	}
	const setAvailabe = () => {
		// authenticate
		// login
		// enterLoop
		// setPresence
		if(WebSocket.OPEN === webSocket.current.readyState) {
			const oUpdateMyAbsentState = {
					// _type: "AsnUpdateMyAbsentStateArgument", // generated from: sOperation by wssSend
					absentstate: {
					}
				};
			// wssSend("UpdateMyAbsentState", oUpdateMyAbsentState);
			const oAbsentStateSetUser = {
					// _type: "AsnAbsentStateSetUserArgument", // generated from: sOperation by wssSend
					absentstate: {
						u8sContactId: "sip:psi@estos.de",
						u8sUsername: "",
						stTimeFrom: "",
						stTimeTo: "",
						iAbsentState: 0, // eABSENTSTATENOTABSENT(0), Available
						u8sMessage: ""
					}
				};
			wssSend("AbsentStateSetUser", oAbsentStateSetUser);
		}
	}
	const getIdTokenAsync = (ePrompt) => {
/*
* try login with: Prompt.None to check userinteraction is required
*/
		const requestConfig = { // interface [AuthRequestConfig](https://docs.expo.dev/versions/latest/sdk/auth-session/#authrequestconfig)
				clientId: 'a26fba9c-c752-4af1-8be4-ba80d2a4d36e',
				scopes: ['openid', 'profile', 'email', 'offline_access'],
				responseType: ResponseType.IdToken, // https://docs.expo.dev/versions/latest/sdk/auth-session/#idtoken
				extraParams: { nonce: "nonce" }, // https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type
				prompt: ePrompt,
				redirectUri: makeRedirectUri(makeRedirectUriOptions)
			},
		_request = new AuthRequest(requestConfig);
		return _request.promptAsync(discoveryDoc);
	}
	const [ bNeedsUserInteraction, SetNeedsUserInteraction ] = React.useState(true);
	const checkNoUserInteraction = () => {
		getIdTokenAsync(Prompt.None)
			.then(authSessionResult => {
					console.log("AuthSessionResult.type:", authSessionResult.type); // [AuthRequest.type](https://docs.expo.dev/versions/latest/sdk/auth-session/#authsessionresult)
					if("success" !== authSessionResult.type)
						throw new Error(authSessionResult.error.message); // "requires interaction"

					const oTR = TokenResponse.fromQueryParams(authSessionResult.params);
					console.log("idToken:", oTR.idToken);
					return iNetLoginAsync(oTR.idToken);
				})
			.then(oWebSocket => {
					webSocket.current = oWebSocket;
					console.log("LoggedIn! (authenticated, connected and WebSocket establish'ed)")
					SetNeedsUserInteraction(false);
				})
			.catch(e => console.log("checkNoUserInteraction() failed:", e));
	}
	const exchangeCode = () => {
		const config = { // interface [AccessTokenRequestConfig](https://docs.expo.dev/versions/latest/sdk/auth-session/#accesstokenrequestconfig)
				code: response.params.code,
				redirectUri: makeRedirectUri({ scheme: 'azuread'})
			};
		exchangeCodeAsync(config, discoveryDoc)
			.then(data => console.log(data));
	}
	const _createURL = () => {
/*
* [Expo Linking](https://docs.expo.dev/versions/latest/sdk/linking/)
* ich kann aus meiner "Anwendung" heraus zu einer anderen Site Navigieren ...
* wobei es egal ist ob ich in einem Browser, Expo Go, ... gehosted bin.
* [Examples](https://docs.expo.dev/versions/latest/sdk/linking/#examples)
* liefert einen, zum Environment/Host, passenden Url ...
*/
		console.log("createURL() =>", Linking.createURL("deepLink")); // create a link into YOUR App
		console.log("baseUrl:", baseUrl); // nur der vollstaendigkeit halber (wird nicht verwendet)
		console.log("Platform.OS:", Platform.OS); // nur der vollstaendigkeit halber (wird nicht verwendet)
		Linking.getInitialURL()
			.then(sInitialURL => console.log("getInitialURL() =>", sInitialURL)); // where we come from

		if("web" === Platform.OS) {
			console.assert(baseUrl); // haben wir IMMER im fall: "web" === Platform.OS
/*
* UseCase: the App is executed from within: Expo Go App `npx expo start` using: ${baseUrl}
* Web (dev): https://localhost:19006/deepLink
* Web (prod): https://myapp.com/deepLink
*
* wenn wir eine SPA sind, also im Browser/Web, ist der returnUrl fuer ein einfaches: "navigate-back" ueberfluessig.
* in allen anderen faellen koennen wir damit den workflow steuern.
*/
			// Linking.openURL(`https://auth.expo.io/@pwsimon/expo-azuread/start?authUrl=http://ws0021.estos.de/etapisrvsdk/solution/sso/redirect&returnUrl=http://localhost:19006/authRedirect?id_token=hurts`);
			// Linking.openURL(`http://ws0021.estos.de/etapisrvsdk/solution/sso/redirect`); // configure IIS reidrect: ${baseUrl}
			// Linking.openURL(`http://ws0021.estos.de/etapisrvsdk/solution/sso/expo-linking.html?returnUrl=${baseUrl}`);
			// Linking.openURL('https://expo.dev');
		} else {
/*
* UseCase: the App is executed from within: (custom build) Expo Go App `npx expo start --dev-client`
* Bare: <scheme>://path - uses provided scheme or scheme from Expo config scheme.
* Standalone, Custom: yourscheme://deepLink
* Expo Client (dev): exp://128.0.0.1:19000/--/deepLink // [Creating URLs](https://docs.expo.dev/guides/linking/#creating-urls)
* Expo Client (prod): exp://u.expo.dev/[project-id]?channel-name=[channel-name]&runtime-version=[runtime-version]
*/
			// Linking.openURL(`http://ws0021.estos.de/etapisrvsdk/solution/sso/expo-linking.html?returnUrl=${baseUrl}`);
			// Linking.openURL('https://expo.dev'); // switch to installed Browser
			// Linking.openSettings(); // the SettingsPage from Expo Go App appear
		}
	}
	const _makeRedirectUri = () => {
/*
* type [AuthSessionRedirectUriOptions](https://docs.expo.dev/versions/latest/sdk/auth-session/#authsessionredirecturioptions)
* "https://auth.expo.io/@your-username/your-app-slug/start"
* eg. https://auth.expo.io/@pwsimon/expo-azuread/start?authUrl=http://ws0021.estos.de/etapisrvsdk/solution/sso/redirect&returnUrl=http://localhost:19006/authRedirect?id_token=hurts
redirectUri = "" // [Using auth.expo.io proxy?](https://github.com/expo/fyi/blob/main/auth-proxy-migration.md#using-authexpoio-proxy)
*/
		const expoAuthProxyOptions = {
					projectNameForProxy: "@pwsimon/expo-azuread/start",
					useProxy: true
				},
			options = {
					path: 'expo-AzureAD',
					scheme: 'azuread'
				},
 			// (AuthSession.makeRedirectUri)[https://docs.expo.dev/versions/latest/sdk/auth-session/#authsessionmakeredirecturioptions]
			redirectUri = makeRedirectUri(options); // expoAuthProxyOptions | options | ...
/*
* die [Expo AuthSession](https://docs.expo.dev/versions/latest/sdk/auth-session/) generiert fuer fuer jeden
* UseCase/Context: einen speziellen RedirectUri
* Development Build: azuread:///
* Expo Go: exp://localhost:19000
* Web dev: https://localhost:19006
* Web prod: https://yourwebsite.com
*/
		console.log("makeRedirectUri() =>", redirectUri);
	}
	const customAuthProxy = () => {
/*
* Das ist die variante/versuch mit dem selfHosted AuthProxy.
* Der fuer die App (msal-react-spa) konfigurierte: Umleitungs-URI zeigt auf *meinen* AuthProxy.
* Azure App-Registrierungen erlauben mehrere Umleitungs-URI. So koennen wir beide statisch angeben.
* welcher davon letztlich/tatsaechlich verwendet wir ergibt sich aus den QueryParametern zum IdProvider
* local development: "http://localhost:1310/"
* internet: "https://authproxy.azurewebsites.net/"
*/
		const authServiceUrl = encodeURIComponent("https://login.microsoftonline.com/a0225615-7f89-4786-a96e-2bd64c8db5c7/oauth2/v2.0/authorize"); // we encode this, because it will be send as a query parameter
		const authServiceUrlParameter = `authServiceUrl=${authServiceUrl}`;
		const authUrl = `http://localhost:1310?${authServiceUrlParameter}`;
		const options = {
				authUrl,
				returnUrl: "azuread://authProxy" // YOUR_DEEP_LINK
			}; // [AuthSession.startAsync(options)](https://docs.expo.dev/versions/latest/sdk/auth-session/#authsessionstartasyncoptions)
		startAsync(options)
			.then(authSessionResult => { // [Type AuthSessionResult](https://docs.expo.dev/versions/latest/sdk/auth-session/#authsessionresult)
					console.log("returned: (type)", authSessionResult.type);
				});
	}
	const expoAuthProxy = () => {
/*
* Das ist die variante/versuch mit dem Expo AuthProxy
* eine loesung mittels: Proxy wirft die folgenden Fragen auf:
* 1.) der Expo AuthProxy bzw. eine 'Proxy' loesung ist genrell 'deprecated'
* 2.) der Expo AuthProxy kommt immer mit einer 'unangenehmen' sicherheits-warnung
* In verbindung mit dem AzureAD gibt es da ein spezielles problem.
* Ich das vom Expo AuthProxy geforderte '@' nicht verwenden ...
* scheitert das an den [Einschraenkungen für Umleitungs-URI/Antwort-URL](https://learn.microsoft.com/de-de/azure/active-directory/develop/reply-url)
*
* loesungs-ansatz(e)
* 1.) selbst gehosteter [AuthProxy](https://docs.expo.dev/versions/latest/sdk/auth-session/#proxy-service)
* 2.) [Expo AuthProxy](https://auth.expo.io) und einen IdProvider ohne Einschraenkung beim Umleitungs-URI
*     *keine* wirkliche option denn das feature wird kuenftig SDK > 48 nicht mehr verfuegbar sein
*     eine Migration nach Deeplinking scheitert in kombination mit AzureAD wieder am Umleitungs-URI
*/
		const options = {
				authUrl: "https://login.microsoftonline.com/a0225615-7f89-4786-a96e-2bd64c8db5c7/oauth2/v2.0/authorize",
				// returnUrl: "",
				projectNameForProxy: "@pwsimon/expo-azuread/start"
			}; // [AuthSession.startAsync(options)](https://docs.expo.dev/versions/latest/sdk/auth-session/#authsessionstartasyncoptions)
		startAsync(options)
			.then(authSessionResult => { // [Type AuthSessionResult](https://docs.expo.dev/versions/latest/sdk/auth-session/#authsessionresult)
					console.log("returned: (type)", authSessionResult.type);
				});
	}

	return (
			<View>
				<Text>URL: {Linking.createURL("")}</Text>
				<Button
					disabled={!request || !bNeedsUserInteraction}
					title="Login"
					onPress={(e) => { authenticate() }}>
				</Button>
				<Button
					disabled={!discoveryDoc}
					title="Logout"
					onPress={e => { logoff() }}>
				</Button>
				<Button
					disable={!discoveryDoc}
					title="test"
					onPress={(e) => { setAvailabe() }}>
				</Button>
				<StatusBar></StatusBar>
			</View>
		);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
