import * as ical from 'ical.js';
import moment, { duration, parseZone } from 'moment';

type Event = {
  title: string;
  start: moment.Moment;
  end: moment.Moment;
};

export default class ICalendar {
  private context: string;
  private icsUrl: string | undefined = undefined;
  private nextEvent: Event | undefined = undefined;
  private hoursLimit = 24;

  constructor(context: string) {
    this.context = context;
  }

  setIcsUrl(icsUrl: string) {
    this.icsUrl = icsUrl;
  }

  getNextEvent(): Event | undefined {
    return this.nextEvent;
  }

  async getNewEvents(): Promise<Event | undefined> {
    if (!this.icsUrl) {
      return;
    }

    const response = await fetch(this.icsUrl).then((response) => {
      if (!response.ok) {
        throw new Error('Bad response from server');
      }
      return response;
    });

    if (!response) {
      this.nextEvent = undefined;
      throw new Error('No valid response from server');
    }

    const body = await (response as Response).text();
    const calData = ical.parse(body);
    const vCalendar = new ical.Component(calData);
    const vtimezone = vCalendar.getFirstSubcomponent('vtimezone');
    const events = vCalendar.getAllSubcomponents('vevent');

    const now = moment();
    const limit = moment().add(this.hoursLimit, 'hours');

    for (const event of events) {
      const start = event.getFirstPropertyValue('dtstart');
      const end = event.getFirstPropertyValue('dtend');
      if (vtimezone) {
        start.zone = new ical.Timezone(vtimezone);
        end.zone = new ical.Timezone(vtimezone);
      }
      const startWithTZ = parseZone(start.toJSDate()).utcOffset(start.utcOffset() / 60);
      const endWithTZ = parseZone(end.toJSDate()).utcOffset(end.utcOffset() / 60);
      if (startWithTZ.isAfter(now) && startWithTZ.isBefore(limit)) {
        this.nextEvent = {
          end: endWithTZ,
          start: startWithTZ,
          title: event.getFirstPropertyValue('summary') as string,
        };
        break;
      } else if (startWithTZ.isAfter(limit)) {
        break;
      }
    }

    return this.nextEvent;
  }
}
