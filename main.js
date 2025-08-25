// EmulatorJS Multi-System Netplay PlayCode

let emulator = null;
let controllerMap = {};
let netplaySocket = null;
const NETPLAY_SERVER = 'ws://localhost:8080'; // Change if deploying server
let currentSystem = 'gba';
let currentRomBuffer = null;

const SYSTEM_DEFAULT_ROM = {
  gba: 'https://cdn.emulatorjs.org/roms/gba/Pokemon%20FireRed.gba',
  gb: 'https://cdn.emulatorjs.org/roms/gb/Tetris.gb',
  nes: 'https://cdn.emulatorjs.org/roms/nes/smb.nes',
  vb: 'https://cdn.emulatorjs.org/roms/vb/Red%20Alarm.vb',
  snes: 'https://cdn.emulatorjs.org/roms/snes/SMW.sfc',
  nds: '', // Needs BIOS, not supported in demo
  n64: 'https://cdn.emulatorjs.org/roms/n64/Super%20Mario%2064.n64',
  sms: 'https://cdn.emulatorjs.org/roms/sms/Sonic.sms',
  genesis: 'https://cdn.emulatorjs.org/roms/genesis/Sonic.gen',
  gg: 'https://cdn.emulatorjs.org/roms/gg/Sonic.gg',
  saturn: '', // Needs BIOS
  sega32x: '', // Needs BIOS
  segacd: '', // Needs BIOS
  atari2600: 'https://cdn.emulatorjs.org/roms/atari2600/Pacman.a26',
  atari5200: '', 
  atari7800: '', 
  lynx: '', 
  jaguar: '', 
  c64: 'https://cdn.emulatorjs.org/roms/c64/BoulderDash.c64',
  c128: '', 
  amiga: '', 
  pet: '', 
  plus4: '', 
  vic20: '', 
  psx: '', // Needs BIOS
  psp: '', // Needs BIOS
  arcade: '', // Needs BIOS
  '3do': '', // Needs BIOS
  mame2003: '', // Needs BIOS
  coleco: '', 
};

function defaultControllerMap(system = 'nes') {
  return {
    'A': 'X',
    'B': 'Z',
    'Start': 'Enter',
    'Select': 'Shift',
    'Up': 'ArrowUp',
    'Down': 'ArrowDown',
    'Left': 'ArrowLeft',
    'Right': 'ArrowRight'
  };
}

// ---- Emulator Initialization ----
function startEmulator(romUrl, system, buffer) {
  controllerMap = defaultControllerMap(system);
  if (emulator) emulator.destroy?.();
  emulator = new window.EmulatorJS({
    container: document.getElementById('emulator-container'),
    romUrl: romUrl && !buffer ? romUrl : undefined,
    romBuffer: buffer,
    system: system,
    volume: 0.5,
    persistentSave: true,
    keyMapping: controllerMap
  });
}

function loadDefaultRom(system) {
  if (SYSTEM_DEFAULT_ROM[system]) {
    startEmulator(SYSTEM_DEFAULT_ROM[system], system, null);
    currentSystem = system;
    currentRomBuffer = null;
  } else {
    document.getElementById('emulator-container').textContent = 'Please upload a ROM for this system.';
  }
}

document.getElementById('systemSelect').onchange = (e) => {
  const system = e.target.value;
  loadDefaultRom(system);
};

document.getElementById('romInput').onchange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const buffer = await file.arrayBuffer();
  currentRomBuffer = buffer;
  startEmulator(null, document.getElementById('systemSelect').value, buffer);
};

const romDrop = document.getElementById('romDrop');
romDrop.ondragover = (e) => { e.preventDefault(); romDrop.classList.add('dragover'); };
romDrop.ondragleave = () => romDrop.classList.remove('dragover');
romDrop.ondrop = async (e) => {
  e.preventDefault();
  romDrop.classList.remove('dragover');
  const file = e.dataTransfer.files[0];
  if (!file) return;
  const buffer = await file.arrayBuffer();
  currentRomBuffer = buffer;
  startEmulator(null, document.getElementById('systemSelect').value, buffer);
};

loadDefaultRom(document.getElementById('systemSelect').value);

// ---- Controls ----
document.getElementById('fullscreenBtn').onclick = () => emulator.setFullscreen(true);
document.getElementById('volumeSlider').oninput = (e) => emulator.setVolume(e.target.value);
document.getElementById('saveStateBtn').onclick = () => emulator.saveState();
document.getElementById('loadStateBtn').onclick = () => emulator.loadState();

document.getElementById('downloadStateBtn').onclick = async () => {
  const state = await emulator.saveState({ asBuffer: true });
  const blob = new Blob([state], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `save-state-${currentSystem}.sav`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

document.getElementById('uploadStateBtn').onclick = () => {
  document.getElementById('uploadStateInput').click();
};
document.getElementById('uploadStateInput').onchange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const arrayBuffer = await file.arrayBuffer();
  emulator.loadState(arrayBuffer);
};

// ---- Controller Remapping ----
const remapBtn = document.getElementById('remapBtn');
const remapUI = document.getElementById('remap-ui');
const remapForm = document.getElementById('remapForm');
const closeRemap = document.getElementById('closeRemap');

remapBtn.onclick = () => {
  remapUI.style.display = 'block';
  remapForm.innerHTML = '';
  Object.keys(controllerMap).forEach(btn => {
    const label = document.createElement('label');
    label.textContent = `${btn}: `;
    const input = document.createElement('input');
    input.type = 'text';
    input.value = controllerMap[btn];
    input.name = btn;
    remapForm.appendChild(label);
    remapForm.appendChild(input);
    remapForm.appendChild(document.createElement('br'));
  });
  const saveBtn = document.createElement('button');
  saveBtn.textContent = 'Save Mapping';
  saveBtn.type = 'submit';
  remapForm.appendChild(saveBtn);
};

remapForm.onsubmit = (e) => {
  e.preventDefault();
  const newMap = {};
  Object.keys(controllerMap).forEach(btn => {
    newMap[btn] = remapForm.elements[btn].value || controllerMap[btn];
  });
  controllerMap = newMap;
  emulator.setKeyMapping(controllerMap);
  remapUI.style.display = 'none';
};

closeRemap.onclick = () => { remapUI.style.display = 'none'; };

// ---- Netplay Advanced Sync ----
document.getElementById('netplayBtn').onclick = () => {
  document.getElementById('netplay-ui').style.display = 'block';
};

document.getElementById('startNetplay').onclick = () => {
  const room = document.getElementById('roomName').value;
  netplaySocket = new WebSocket(NETPLAY_SERVER);
  netplaySocket.onopen = () => {
    netplaySocket.send(JSON.stringify({ type: 'join', room, system: currentSystem }));
    document.getElementById('netplayStatus').textContent = `Joined room: ${room}`;
    setInterval(async () => {
      if (emulator.isRunning) {
        const state = await emulator.saveState({ asBuffer: true });
        netplaySocket.send(JSON.stringify({ type: 'sync', state: Array.from(new Uint8Array(state)) }));
      }
    }, 100);
  };
  netplaySocket.onmessage = async (msg) => {
    const data = JSON.parse(msg.data);
    if (data.type === 'chat') {
      const chatList = document.getElementById('chatMessages');
      const item = document.createElement('li');
      item.textContent = data.message;
      chatList.appendChild(item);
    }
    if (data.type === 'sync') {
      if (data.state) {
        const buffer = new Uint8Array(data.state).buffer;
        emulator.loadState(buffer);
      }
    }
  };
};

document.getElementById('sendChat').onclick = () => {
  const msg = document.getElementById('chatInput').value;
  if (netplaySocket && netplaySocket.readyState === 1) {
    netplaySocket.send(JSON.stringify({ type: 'chat', message: msg }));
    document.getElementById('chatInput').value = '';
  }
};

document.getElementById('inviteBtn').onclick = () => {
  const room = document.getElementById('roomName').value;
  const link = `${location.origin}?system=${currentSystem}&room=${encodeURIComponent(room)}`;
  document.getElementById('inviteLink').textContent = link;
};
