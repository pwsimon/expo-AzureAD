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
		ResponseType // [Types](https://docs.expo.dev/versions/latest/sdk/auth-session/#types)
	} from 'expo-auth-session'; // [Expo AuthSession](https://docs.expo.dev/versions/latest/sdk/auth-session/)
import {
	Platform,
	StyleSheet,
	View,
	Text,
	Button } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

export default function App() {
	// interface [DiscoveryDocument](https://docs.expo.dev/versions/latest/sdk/auth-session/#discoverydocument)
	const discoveryDoc = useAutoDiscovery('https://login.microsoftonline.com/a0225615-7f89-4786-a96e-2bd64c8db5c7/v2.0'); // Endpoint

	const requestConfig = { // interface [AuthRequestConfig](https://docs.expo.dev/versions/latest/sdk/auth-session/#authrequestconfig)
			clientId: 'a26fba9c-c752-4af1-8be4-ba80d2a4d36e',
			scopes: ['openid', 'profile', 'email', 'offline_access'],
			responseType: ResponseType.IdToken, // https://docs.expo.dev/versions/latest/sdk/auth-session/#idtoken
			extraParams: { nonce: "nonce" }, // https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type
			redirectUri: makeRedirectUri({
					scheme: 'azuread' // https://docs.expo.dev/versions/latest/config/app/#scheme
				})
		}
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
			if (response && response.type === 'success') {
				const oTR = TokenResponse.fromQueryParams(response.params),
					token = response.params.access_token;

				console.log("response changed => type:", response.type);
				iNetTokenVerify(oTR.idToken);
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
	*     npx uri-scheme open exp://192.168.178.41:19000/--/somepath/into/app?hello=world --ios // pshome
	*/
	const baseUrl =	Linking.useURL(); 

	const login = () => {
		const promptOptions = null; // [AuthRequestPromptOptions](https://docs.expo.dev/versions/latest/sdk/auth-session/#authrequestpromptoptions)
		promptAsync(/*promptOptions*/)
			.then(authSessionResult => { // [Type AuthSessionResult](https://docs.expo.dev/versions/latest/sdk/auth-session/#authsessionresult)
					const oTR = TokenResponse.fromQueryParams(authSessionResult.params);
					// console.log("fullfilled => type:", authSessionResult.type);
				})
			.catch((e) => { console.log("exception:", e); });
	}
	const sUCSID = "ws0021.local";
	const iNetTokenVerify = (sToken) => {
/*
* using UCConnect needs: UCSID/Tenant (Mandant)
* folgende constellation:
* UCServer, \\ws0021\dev\procall_master (feature/PROCALL-3267-verifyJWT), 
* AppServer, IIS
* Achtung!
* ein Login/CreateSession ist vermutlich einfacher denn:
* wg. verschaerfter CORS regeln im UCConnect darf ich keine header x-sessionid mehr schicken ...
*/
		fetch(`https://devuccontroller.ucconnect.de/controller/client/ucws?ucsid=${sUCSID}`)
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
		// console.log("createURL() =>", Linking.createURL("path"));
		console.log("baseUrl:", baseUrl);
		if("web" === Platform.OS) {
/*
* wenn wir eine SPA sind, also im Browser/Web, ist der returnUrl fuer ein einfaches: "navigate-back" ueberfluessig.
* in allen anderen faellen koennen wir damit den workflow steuern.
* Web (dev): https://localhost:19006/path
*/
			// Linking.openURL(`https://auth.expo.io/@pwsimon/expo-azuread/start?authUrl=http://ws0021.estos.de/etapisrvsdk/solution/sso/redirect&returnUrl=http://localhost:19006/authRedirect?id_token=hurts`);
			Linking.openURL(`http://ws0021.estos.de/etapisrvsdk/solution/sso/redirect`); // configure IIS reidrect: ${baseUrl}
			// Linking.openURL(`http://ws0021.estos.de/etapisrvsdk/solution/sso/expo-linking.html?returnUrl=${baseUrl}`);
			// Linking.openURL('https://expo.dev');
		} else {
/*
* UseCase: the App is executed from within: Expo Go App `npx expo start`
* Expo Client (dev): exp://128.0.0.1:19000/--/path
* Expo Client (prod): exp://exp.host/@yourname/your-app/--/path
*/
			Linking.openURL(`http://ws0021.estos.de/etapisrvsdk/solution/sso/expo-linking.html?returnUrl=${baseUrl}`);
			// Linking.openURL('https://expo.dev'); // switch to installed Browser
			// Linking.openSettings(); // the SettingsPage from Expo Go App appear

/*
* UseCase: the App is executed as: `eas build --profile development --platform android`
*/
}
	}
	const _makeRedirectUri = () => {
		/*
		* type [AuthSessionRedirectUriOptions](https://docs.expo.dev/versions/latest/sdk/auth-session/#authsessionredirecturioptions)
		* "https://auth.expo.io/@your-username/your-app-slug/start"
		* eg. https://auth.expo.io/@pwsimon/expo-azuread/start?authUrl=http://ws0021.estos.de/etapisrvsdk/solution/sso/redirect&returnUrl=http://localhost:19006/authRedirect?id_token=hurts
		redirectUri2 = "" // [Using auth.expo.io proxy?](https://github.com/expo/fyi/blob/main/auth-proxy-migration.md#using-authexpoio-proxy)
		*/
		const proxyOptions = {
					scheme: 'azuread',
					preferLocalhost: true,
					projectNameForProxy: "@pwsimon/expo-azuread/start",
					useProxy: true
				},
			options = {
					scheme: 'azuread',
					preferLocalhost: true
				},
			redirectUri2 = makeRedirectUri(proxyOptions); // (AuthSession.makeRedirectUri)[https://docs.expo.dev/versions/latest/sdk/auth-session/#authsessionmakeredirecturioptions]
		// Development Build: azuread:///
		// Expo Go: exp://localhost:19000
		// Web dev: https://localhost:19006
		// Web prod: https://yourwebsite.com
		console.log("makeRedirectUri() =>", redirectUri2);
	}
	const customAuthProxy = () => {
/*
* Das ist die variante/versuch mit dem selfHosted AuthProxy.
* Der im Azure konfigurierte: Umleitungs-URI zeigt auf *meinen* AuthProxy
*/
		const authServiceUrl = encodeURIComponent("https://login.microsoftonline.com/a0225615-7f89-4786-a96e-2bd64c8db5c7/oauth2/v2.0/authorize"); // we encode this, because it will be send as a query parameter
		const authServiceUrlParameter = `authServiceUrl=${authServiceUrl}`;
		const authUrl = `http://localhost:1310?${authServiceUrlParameter}`;
		const options = {
				authUrl,
				returnUrl: "azuread://auth" // YOUR_DEEP_LINK
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
				<Text>URL: {baseUrl}</Text>
				<Button
					disabled={!request}
					title="Login"
					onPress={(e) => { login() }}>
				</Button>
				<Button
					title="test"
					onPress={(e) => { customAuthProxy() }}>
				</Button>
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
