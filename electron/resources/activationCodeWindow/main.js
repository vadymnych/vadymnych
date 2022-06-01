/** This is IpcRender process of "Activation code window" **/
const electron = require('electron');

const minimizeBtn = document.getElementById('minimizeBtn');
const closeBtn = document.getElementById('closeBtn');

minimizeBtn.addEventListener('click', () => {
  electron.ipcRenderer.send('activation-minimize');
});

closeBtn.addEventListener('click', () => {
  electron.ipcRenderer.send('activation-close');
});

const activationCodeBtn = document.getElementById('activationCodeBtn');
const activationCodeInput = document.getElementById('activationCodeInput');
const validationMessage = document.getElementById('validationMessage');
let timeoutId = 0;

activationCodeBtn.addEventListener('click', (event) => {
  event.preventDefault();
  activationCodeBtn.disabled = true;
  console.log(activationCodeInput.value);
  clearTimeout(timeoutId);
  electron.ipcRenderer.send('activation-code', activationCodeInput.value);
});

electron.ipcRenderer.on('activation-code-error', (event, data) => {
  console.log('Here activation code error data:', data);
  activationCodeBtn.disabled = false;
  validationMessage.className = 'content-activation__input-validation__failed';
  activationCodeInput.classList.add('input-error');
  timeoutId = setTimeout(() => {
    validationMessage.className = 'content-activation__input-validation';
    activationCodeInput.classList.remove('input-error');
  }, 3000);
});
