type LogEvent = {
  serverId: string;
  line: string;
  ts: number;
};

const eventsMap: Record<string, LogEvent[]> = {};
const subscribers: Array<(e: LogEvent) => void> = [];

export function addLogEvent(serverId: string, line: string) {
  const ev: LogEvent = { serverId, line, ts: Date.now() };
  if (!eventsMap[serverId]) eventsMap[serverId] = [];
  eventsMap[serverId].push(ev);
  // keep size reasonable
  if (eventsMap[serverId].length > 5000) eventsMap[serverId].shift();
  subscribers.forEach((s) => s(ev));
}

export function getEvents(serverId: string): LogEvent[] {
  return eventsMap[serverId] ? [...eventsMap[serverId]] : [];
}

export function subscribeLogs(fn: (e: LogEvent) => void) {
  subscribers.push(fn);
  return () => {
    const idx = subscribers.indexOf(fn);
    if (idx >= 0) subscribers.splice(idx, 1);
  };
}

export function clearEvents(serverId: string) {
  eventsMap[serverId] = [];
}

export default { addLogEvent, getEvents, subscribeLogs, clearEvents };
