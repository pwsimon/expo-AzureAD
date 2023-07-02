# getting started
start using the local Git Repository created by `npx create-expo-app expo-AzureAD` and sync them to DevOps.
Create new/empty DevOps Repository and set/change the remote orgin of your local Git Repository by the values provided from DevOps.

# Environment
wir [Installation](https://docs.expo.dev/workflow/expo-cli/#installation) die entwicklungsumgebung Expo CLI (local).  
[Create your first app](https://docs.expo.dev/tutorial/create-your-first-app/)

# Run
nach prioritaet, in der realisierung, geordnet brauchen wir eine Loesung fuer SPA (incl. backend).
Die fehlende unterstuetzung fuer einen UseCase ist ein KO kriterium.

> mit einer SPA koennen wir *alle* Platformen abdecken.
> der einfachheit halber stellen wir mit der *static* Site auch die RedirectUri-Page bereit.

## [Expo Go](https://docs.expo.dev/get-started/expo-go/)
mit diesem Subsystem ([development-server](https://docs.expo.dev/more/glossary-of-terms/#development-server)) lassen wir die App local (Browser) und in der [Expo Go](https://expo.dev/client) App (Android) laufen.
Sowohl die Browser als auch die Android version/variante muessen sich dazu mit dem development-server verbinden.

## [Run the app on mobile and web](https://docs.expo.io/introduction/walkthrough/#start-the-project)

    npx expo start // within Expo Go

## [Start the development server](https://docs.expo.dev/develop/development-builds/use-development-builds/#start-the-development-server)
typischerweise wird ein build (.apk) auf einem Device installiert.

    npx expo start --dev-client

# UseCases/Scenarios
standard schoen und gut aber welcher? je nach Anbieter (IdProvider) und dessen faehigkeiten & einschraenkungen hat das *massiven* einfluss auf das
"wie" muss eine Anwendung gebaut werden bzw. welche infrastuktur ist noetig.

wie aus dem Project-Namen schon hervorgeht konzentrieren/codieren wir fuer Azure AD only.
mit dem gruenen Code beschreiben wir ausfuehrlich das warum.

zum Debuggen/Lernen siehe auch: [npm oidc-provider](https://www.npmjs.com/package/oidc-provider)

## Prepare to: Authenticate

[Azure](https://docs.expo.dev/guides/authentication/#azure)

## Next Step/ToDo

**Run within MobileDevice**

## makeRedirectUri
die [Expo AuthSession](https://docs.expo.dev/versions/latest/sdk/auth-session/) generiert fuer fuer jeden UseCase: 
(Development Build, Expo Go, Web dev, Web prod, standalone-app) einen speziellen RedirectUri ...

verschiedene IdProvider erlauben keinen frei definierbaren RedirectUri. z.B. scheme
Alternativen: mit der registrierung der App bekommt man einen RedirectUri zugewiesen.
dann, sofern moeglich, diesen als RedirectUri in der App verwenden.

## UseCase: Web dev
hier wird mittels eines [Window: open() method](https://developer.mozilla.org/en-US/docs/Web/API/Window/open) zum IdProvider navigiert.
Da hier ein neuer browsing context erzeugt wird ist das nicht einfach mit den DeveloperTools (F12) zu untersuchen.
Der mit dem: login/proptAsync generierte: [makeRedirectUri](https://docs.expo.dev/versions/latest/sdk/auth-session/#authsessionmakeredirecturioptions) fuer den authenticate request zeigt auf den *eigene* BaseUri.

# Deploy for Android
## Deploy a project to *Expo Go* hosting
Die [Expo Go](https://docs.expo.dev/get-started/expo-go/) App kann die Anwendung direkt vom development-server laden (siehe oben).
Deployment-Setup idealerweise mittels [Getting started](https://docs.expo.dev/eas-update/getting-started/)

    npx expo install expo-updates // install the latest expo-updates library
    eas update:configure // initialize your project with EAS Update
    eas build:configure // set up the configuration file (eas.json) for builds

### [EAS Update](https://docs.expo.dev/eas-update/introduction/)
Mit `eas update` wird die Anwendung so verpackt (gebundled) das sie in der Expo Go App laufen kann.
Mit dem [update](https://expo.dev/accounts/pwsimon/projects/expo-azuread/updates) wird das dann auch unter [branches](https://expo.dev/accounts/pwsimon/projects/expo-azuread/branches) gelistet.

    eas update

# Deploy for the Web
[GitHub Pages](https://docs.expo.dev/distribution/publishing-websites/#github-pages) or. [Static website hosting in Azure Storage](https://learn.microsoft.com/en-us/azure/storage/blobs/storage-blob-static-website)