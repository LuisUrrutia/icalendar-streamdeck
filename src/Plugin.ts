import { Streamdeck } from '@rweich/streamdeck-ts';
import moment, { duration } from 'moment';

import Drawer from './Drawer';
import ICalendar from './ICalendar';
import { Settings } from './Settings';

const REFRESH_INTERVAL_MS = 300_000;
const DRAW_INTERVAL_MS = 1000;

const calendars: Record<string, ICalendar> = {};

const configs: Record<string, Settings> = {};

const refreshIntervals: Record<string, NodeJS.Timeout> = {};
const drawIntervals: Record<string, NodeJS.Timeout> = {};

const drawer = new Drawer(144, 144);
const plugin = new Streamdeck().plugin();
let loading = true;

plugin.on('willAppear', ({ context }) => {
  plugin.setTitle('Loading...', context);
  plugin.getSettings(context);

  calendars[context] = new ICalendar(context);

  refreshIntervals[context] = setInterval(() => refresh(context), REFRESH_INTERVAL_MS);
  drawIntervals[context] = setInterval(() => draw(context), DRAW_INTERVAL_MS);
});

plugin.on('willDisappear', ({ context }) => {
  clearInterval(refreshIntervals[context]);
  clearInterval(drawIntervals[context]);
});

plugin.on('didReceiveSettings', ({ context, settings }) => {
  configs[context] = settings as Settings;
  calendars[context].setIcsUrl(configs[context].ics);
  refresh(context);
});

const refresh = async (context: string) => {
  calendars[context]
    .getNewEvents()
    .then((event) => {
      if (!event) {
        plugin.setTitle('No events', context);
      } else {
        plugin.setTitle('', context);
      }
      return;
    })
    .catch(() => {
      plugin.setTitle('Invalid URL', context);
    })
    .finally(() => {
      loading = false;
    });
};

const draw = (context: string) => {
  if (loading) {
    return;
  }

  const event = calendars[context].getNextEvent();
  if (!event) {
    return;
  }

  const delta = duration(event.start.diff(moment()));
  const image = drawer.draw(
    event.title,
    Math.floor(delta.hours()),
    Math.floor(delta.minutes()),
    Math.floor(delta.seconds()),
  );
  plugin.setImage(image, context);
};

export default plugin;
