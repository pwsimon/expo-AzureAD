import * as React from 'react';
import * as WebBrowser from 'expo-web-browser'; // [Expo WebBrowser](https://docs.expo.dev/versions/latest/sdk/webbrowser/)
import {
		useAuthRequest, // [Hooks](https://docs.expo.dev/versions/latest/sdk/auth-session/#hooks)
		useAutoDiscovery,
		makeRedirectUri, // (static) [Methods](https://docs.expo.dev/versions/latest/sdk/auth-session/#methods)
		exchangeCodeAsync,
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
					scheme: 'your.app'
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
				console.log("id_token:", oTR.idToken);
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
	const exchangeCode = () => {
		const config = { // interface [AccessTokenRequestConfig](https://docs.expo.dev/versions/latest/sdk/auth-session/#accesstokenrequestconfig)
				code: response.params.code,
				redirectUri: makeRedirectUri({ scheme: 'your.app'})
			};
		exchangeCodeAsync(config, discoveryDoc)
			.then(data => console.log(data));
	}

	return (
			<View>
				<Button
					disabled={!request}
					title="Login"
					onPress={(e) => { login() }}>
				</Button>
				<Button
					disabled={!response}
					title="exchange"
					onPress={(e) => { exchangeCode() }}>
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
