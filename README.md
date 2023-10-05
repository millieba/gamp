# Karen & Millie's Preparatory Project
## Running the web dashboard
1. Ensure that your system has Node.js and pnpm before proceeding, e.g. by checking their versions, `node -v` and `pnpm -v`. If you don't have pnpm, install it by running `npm install -g pnpm`. For Node.js installation, refer to https://nodejs.org.
2. Open a terminal window, navigate to the folder *web-dashboard* and install project dependencies by running: `pnpm i`.
3. Run the development server: `pnpm dev`.
4. Access the web dashboard at http://localhost:3000.


## Running the VS Code extension
1. Open a terminal window, navigate to the *helloworld* folder and install project dependencies by running `pnpm i`.
2. Open the helloworld project in Visual Studio Code:
   * You can do this manually by launching VS Code and using the "Open Folder" option to select the *helloworld* folder.
   * Alternatively, you can navigate to the *helloworld* folder in your terminal and execute `code .`.
3. Once the *helloworld* folder is open in VS Code, press `F5` on your keyboard to start debugging.
4. A new VS Code window should appear. To access the extension, look in the left sidebar, also known as the explorer. You may need to expand the sidebar's *Hello World* section to see the full extension.
5. To test the available *Hello World* extension command, open the command pallette by pressing `Ctrl + Shift + P` on your keyboard. Then select the *Hello World* command. A notification popup should appear with the text "Hello World from HelloWorld!".

