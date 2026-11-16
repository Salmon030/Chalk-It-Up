CHALK IT UP! - DESKTOP PROJECT
==============================
This folder is a complete Electron project. The game is index.html.
Three ways to get a Windows .exe:

A) NO TOOLS ON YOUR PC (GitHub builds it for you)
   1. Make a free GitHub account and a new repository.
   2. Upload everything in this folder (keep the .github folder).
   3. Open the Actions tab, run "Build Windows exe" (it also runs on every push).
   4. Download the "chalk-it-up-windows" artifact: an installer and a portable .exe.

B) ONE CLICK ON WINDOWS
   Install Node.js from nodejs.org, then double-click build.bat.
   The installer and portable exe appear in the dist folder.

C) BY HAND
   npm install, then npm start to try it, and npm run dist to build.
   (npm run dist:mac and npm run dist:linux build for Mac and Linux.)

AI
   The desktop game talks to the Anthropic API from the app itself.
   Open AI Link in the game and paste your API key, or set the ANTHROPIC_API_KEY environment variable.
   The default model is claude-sonnet-5-5; you can change it in the same screen.

SAVES
   Stored in your user data folder (chalk-store.json), not in a browser.
   Marie's mail buttons open a normal Save dialog.

TIPS
   F11 toggles full screen. Windows may warn about an unsigned app the first time (More info, then Run anyway).
   Fonts: the pixel font loads from Google Fonts when online. For a fully offline exe, put
   PressStart2P-Regular.ttf in the assets folder (the game already looks for it there).
