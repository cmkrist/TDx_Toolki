const SETTINGS = {
    default_calendar: {
        name: 'Primary',
        id: 'primary'
    },
    default_duration: 60,
    auto_schedule: false
};
// Event Handlers
chrome.runtime.onInstalled.addListener(async () => {
    if (! await chrome.storage.sync.get('tdx_options')) {
        chrome.tabs.create({ url: 'index.html' });
    }
});
chrome.storage.onChanged.addListener((changes, namespace) => {
    for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
        if (key === 'tdx_options') {
            updateSettings();
        };
    }
});
// Listen for Messages
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    switch (request.fn) {
        case 'GET_DEFAULT_CALENDAR':
            sendResponse(SETTINGS.default_calendar.name);
            break;
        case 'ADD_EVENT':
            const appt = request.event;
            const calendar = SETTINGS.default_calendar;
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
            if (response.ok) {
                console.log('Event added successfully');
                sendResponse("OK");
            } else {
                throw new Error('Failed to add event');
            }
            break;
        case "FORM_SUBMISSION":
            console.log(request.data);
            const tkn = await chrome.identity.getAuthToken({ interactive: true });
            const evnt = {
                summary: request.data.title,
                description: request.data.description,
                eventType: 'default',
                location: request.data.location || '',
                source: {
                    title: 'TDx Ticket Link',
                    url: request.data.url
                },
                start: {
                    dateTime: new Date(request.data.start).toISOString(),
                    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
                },
                end: {
                    dateTime: new Date(request.data.end).toISOString(),
                    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
                },
                
            };
            if(request.data.requestor) {
                evnt.attendees = [
                    { email: request.data.requestor }
                ]
            }
            const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${SETTINGS.default_calendar.id}/events`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${tkn.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(evnt)
            });
            if (res.ok) {
                console.log('Event added successfully');
                sendResponse(true);
            } else {
                throw new Error('Failed to add event');
            }
            break;
        case 'UPDATE_SETTINGS':
            console.log("Updating Settings");
            updateSettings();
            break;
        default:
            console.log('Invalid function');
            console.log(request.fn);
            break;
    }
});
// Utility Functions
const updateSettings = async () => {
    chrome.storage.sync.get("tdx_options", (data) => {
        if (!data.tdx_options) {
            console.log("No settings found");
            return;
        }
        Object.keys(data.tdx_options).forEach(key => {
            SETTINGS[key] = data.tdx_options[key];
        });
        console.log("Settings Updated");
    });
};

//init
(async () => {
    updateSettings();
})();