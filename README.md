# Emulator
Thanks to EmulatorJS for the inspiration
# EmulatorJS Codespaces Multi-System Netplay Demo

A multi-system browser emulator inspired by [EmulatorJS](https://github.com/emulatorjs/emulatorjs), playable in GitHub Codespaces and PlayCode.io.

---

## Features

- Supports many classic systems (NES, SNES, GBA, Game Boy, Genesis, N64, Atari, Commodore, etc.)
- Upload your own ROM files via file picker or drag & drop
- Save/load/download/upload save states
- Controller remapping UI
- Netplay rooms and chat (optional backend)
- Open-source, ready for Codespaces and PlayCode.io

---

## Credits

- **Inspired by [EmulatorJS](https://github.com/emulatorjs/emulatorjs)**
  - EmulatorJS is an open-source, web-based multi-system emulator project.
  - This project uses the official CDN build for browser emulation.

---

## How to Use in GitHub Codespaces

### 1. **Create your Codespace**

- Click the green **"[Code]"** button at the top of this repo.
- Select **"Create codespace on main"**.
- Wait for the Codespace to initialize (the devcontainer will auto-install dependencies).

### 2. **Start the Frontend**

- In the Codespaces terminal, run:
  ```sh
  npm start
  ```
- Wait for the server to start. Codespaces will automatically forward port **3000**.
- Click the **"Open in Browser"** button for the forwarded port (top right of Codespaces window).

### 3. **(Optional) Start Netplay Backend**

- In a second terminal, run:
  ```sh
  npm run netplay
  ```
- Codespaces will forward port **8080** for WebSocket netplay/chat.

### 4. **Play!**

- Open the app in your browser.
- Select a system and upload your own ROM file (drag-and-drop or file picker).
- Use the emulator controls: save/load states, download/upload states, remap controller keys, fullscreen, adjust volume.
- (Optional) Use netplay and chat by starting the backend and opening the netplay menu.

---

## How to Use in PlayCode.io

- Copy `index.html` and `main.js` into PlayCode.io (or your favorite online IDE).
- Open in browser, and use as above.

---

## License

For personal, educational, and fair-use purposes.  
ROM files must be legally owned.  
EmulatorJS is open-source under GPL.

```
