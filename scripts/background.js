let defaultCalendarName = undefined;

chrome.storage.sync.get("tdx_calendar", (data) => {
    defaultCalendarName = data.tdx_calendar.name;
    console.log("Name Set");
});

chrome.storage.onChanged.addListener((changes, namespace) => {
    for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
      console.log(
        `Storage key "${key}" in namespace "${namespace}" changed.`,
        `Old value was "${oldValue}", new value is "${newValue}".`
      );
    }
  });
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    switch(request.fn) {
        case 'GET_DEFAULT_CALENDAR':
            sendResponse(defaultCalendarName);
            break;
        case 'ADD_EVENT':
            /** Appt Object Definition
             * {
             * title: string,
             * description: string,
             * location: string,
             * start: Date,
             * end: Date,
             * url: string
             * }
             */
            const appt = request.event;
            const calendar = await getDefaultCalendar();
            const token = await chrome.identity.getAuthToken({ interactive: true });
            const event = {
                summary: appt.title,
                description: appt.description,
                eventType: 'default',
                location: appt.location || '',
                source: {
                    title: 'TDx Ticket Link',
                    url: appt.url
                },
                start: {
                    dateTime: new Date(appt.start).toISOString(),
                    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
                },
                end: {
                    dateTime: new Date(appt.end).toISOString(),
                    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
                }
            };
            const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${calendar.id}/events`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(event)
            });
            if(response.ok) {
                console.log('Event added successfully');
                sendResponse(true);
            } else {
                throw new Error('Failed to add event');
                sendResponse(false);
            }
            break;
        default:
            console.log('Invalid function');
            console.log(request.fn);
    }
});

const getDefaultCalendar = async () => {
    const cal = (await chrome.storage.sync.get("tdx_calendar")).tdx_calendar || {};
    return cal;
}
const getAuthToken = async () => {
    try {
        const token = await chrome.identity.getAuthToken({ interactive: true });
        console.log(token || 'No token');
        return token;
    }
    catch (error) {
        console.error(error);
    }
}
