host/contain static part for the SPA (target from RedirectUri).

> es ist *untragbar* das target fuer einen RedirectUri von einem *dienstleister* hosten zu lassen!
> das id_token (location.hash) wird ja mit uebertragen ...

gaengige praxis einiger anbieter ...

# expo (dienstleister)

um den restrictionen von IdProvidern as dem weg zu gehen bietet "expo" einen AuthenticationProxy (deprecated) an.
`https://auth.expo.io/@pwsimon/expo-azuread/start?authUrl=...`

# not part
especially the deploy folder from build. but keep in mind the Build (CI/CD) is not taken from GitHub.