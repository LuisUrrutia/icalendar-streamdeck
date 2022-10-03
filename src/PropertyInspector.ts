import { Streamdeck } from '@rweich/streamdeck-ts';

const pi = new Streamdeck().propertyinspector();

pi.on('websocketOpen', ({ uuid }) => pi.getSettings(uuid));

pi.on('didReceiveSettings', ({ settings }: { settings: any }) => {
  const icsInput = document.querySelector('#ics') as HTMLInputElement;
  if (!icsInput) {
    return;
  }

  if (settings.ics) {
    icsInput.value = settings.ics;
  }
  icsInput.addEventListener('change', (event) => {
    if (!pi.pluginUUID) {
      console.log('pluginUUID not set');
      return;
    }

    const newICS = (event.target as HTMLInputElement).value;
    pi.setSettings(pi.pluginUUID, { ics: newICS });
  });
});

export default pi;
