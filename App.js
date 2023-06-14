import * as React from 'react';
import * as WebBrowser from 'expo-web-browser'; // [Expo WebBrowser](https://docs.expo.dev/versions/latest/sdk/webbrowser/)
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
	StyleSheet,
	View,
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
					scheme: 'your.app' // https://docs.expo.dev/versions/latest/config/app/#scheme
				})
		}
	const [
			request, // [Class AuthRequest](https://docs.expo.dev/versions/latest/sdk/auth-session/#authrequest)
			response, // [Type AuthSessionResult](https://docs.expo.dev/versions/latest/sdk/auth-session/#authsessionresult)
			promptAsync
		] = useAuthRequest(requestConfig, discoveryDoc);

	/*
	* typischerweise erkennen das resolve/reject der Async Function: promptAsync()
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
			.then(oTokenVerifyResult => console.log(oTokenVerifyResult) );
	}
	const exchangeCode = () => {
		const config = { // interface [AccessTokenRequestConfig](https://docs.expo.dev/versions/latest/sdk/auth-session/#accesstokenrequestconfig)
				code: response.params.code,
				redirectUri: makeRedirectUri({ scheme: 'your.app'})
			};
		exchangeCodeAsync(config, discoveryDoc)
			.then(data => console.log(data));
	}
	const _createURL = () => {
		console.log("createURL() =>", createURL("path"));
	}
	const _makeRedirectUri = () => {
		/*
		* type [AuthSessionRedirectUriOptions](https://docs.expo.dev/versions/latest/sdk/auth-session/#authsessionredirecturioptions)
		* "https://auth.expo.io/@your-username/your-app-slug/start"
		* "https://auth.expo.io/@pwsimon/expo-azuread/start"
		redirectUri2 = "" // [Using auth.expo.io proxy?](https://github.com/expo/fyi/blob/main/auth-proxy-migration.md#using-authexpoio-proxy)
		*/
		const proxyOptions = {
					scheme: 'scheme2',
					preferLocalhost: true,
					projectNameForProxy: "@pwsimon/expo-azuread/start",
					useProxy: true
				},
			options = {
					scheme: 'scheme2',
					preferLocalhost: true
				},
			redirectUri2 = makeRedirectUri(proxyOptions); // (AuthSession.makeRedirectUri)[https://docs.expo.dev/versions/latest/sdk/auth-session/#authsessionmakeredirecturioptions]
		// Development Build: scheme2:///
		// Expo Go: exp://localhost:19000
		// Web dev: https://localhost:19006
		// Web prod: https://yourwebsite.com
		console.log("makeRedirectUri() =>", redirectUri2);
	}
	const proxyStartAsync = () => {
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
				<Button
					disabled={!request}
					title="Login"
					onPress={(e) => { login() }}>
				</Button>
				<Button
					title="test"
					onPress={(e) => { proxyStartAsync() }}>
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
