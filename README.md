# getting started
start using the local Git Repository created by `npx create-expo-app expo-AzureAD` and sync them to DevOps.
Create new/empty DevOps Repository and set/change the remote orgin of your local Git Repository by the values provided from DevOps.

# Environment
wir [Installation](https://docs.expo.dev/workflow/expo-cli/#installation) die entwicklungsumgebung Expo CLI (local).  
[Create your first app](https://docs.expo.dev/tutorial/create-your-first-app/)

# [Expo Go](https://docs.expo.dev/get-started/expo-go/)
mit diesem Subsystem ([development-server](https://docs.expo.dev/more/glossary-of-terms/#development-server)) lassen wir die App local (Browser) und in der [Expo Go](https://expo.dev/client) App (Android) laufen.
Sowohl die Browser als auch die Android version/variante muessen sich dazu mit dem development-server verbinden.

# [Run the app on mobile and web](https://docs.expo.io/introduction/walkthrough/#start-the-project)

    npx expo start

# Deploy a project to *Expo Go* hosting
die [Expo Go](https://docs.expo.dev/get-started/expo-go/) App kann die Anwendung direkt vom development-server laden (siehe oben).
Mit [EAS](https://expo.dev/eas) kann man die Anwendung auch in das Expo Internet/Portal deployen und durch die Expo Go App ausfuehren lassen.
Deploy a project to Expo hosting thru Expo CLI using [EAS](https://expo.dev/eas)

    eas init // create or link an EAS project, https://github.com/expo/eas-cli#eas-init
    eas update

## [EAS Update](https://docs.expo.dev/eas-update/introduction/)
Mit `eas update` wird die Anwendung so verpackt (gebundled) das sie in der Expo Go App laufen kann.
Mit dem [update](https://expo.dev/accounts/pwsimon/projects/verybasicv2/updates) wird das dann auch im [Portal](https://expo.dev/accounts/pwsimon/projects/verybasicv2/updates/5a6591b3-a1e4-4ed2-8565-5b7bd62a0b0a) unter [branches](https://expo.dev/accounts/pwsimon/projects/verybasicv2/branches) gelistet.