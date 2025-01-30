
// Global Element Vars
const saveButton = document.getElementById('save-button');
const defaultCalendar = document.getElementById('default-calendar');
const defaultDuration = document.getElementById('default-duration');
const defaultColor = document.getElementById('default-color');
const autoSchedule = document.getElementById('auto-schedule');
// Init
(async () => {
    // Load Settings from storage
    let settings = (await chrome.storage.sync.get('tdx_options')).tdx_options;
    if (!settings) {
        console.error('No settings found');
        settings = {
            default_calendar: null,
            default_duration: 60,
            auto_schedule: false
        };
    }
    // Populate Values
    await populateCalendars();
    // Set default values
    if (settings.default_calendar) defaultCalendar.value = settings.default_calendar.id;
    if (settings.default_duration) defaultDuration.value = settings.default_duration;
    if (settings.auto_schedule) autoSchedule.checked = settings.auto_schedule;
    // Enable Inputs
    defaultCalendar.disabled = false;
    defaultDuration.disabled = false;
    autoSchedule.disabled = false;
    // Event Listeners
    setSaveButtonListener();
})();

// Working
const populateCalendars = async () => {
    const calendarElement = document.getElementById('default-calendar');
    const calendars = await getAllOwnedCalendars();
    calendarElement.innerHTML = calendars.map(calendar => `<option value="${calendar.id}">${calendar.name}</option>`).join('');
    return true;
};
// Working
const setSaveButtonListener = () => {
    // Element Vars
    const saveButton = document.getElementById('save-button');
    const calendarElement = document.getElementById('default-calendar');
    const autoScheduleElement = document.getElementById('auto-schedule');
    // Event Listener
    saveButton.addEventListener('click', async () => {
        const Calendar = {
            id: calendarElement.value,
            name: calendarElement.options[calendarElement.selectedIndex].text
        }
        await chrome.storage.sync.set({
            'tdx_options': {
                'default_calendar': Calendar,
                'default_duration': defaultDuration.value,
                'auto_schedule': autoScheduleElement.checked
            }
        });
        chrome.runtime.sendMessage({ fn: 'UPDATE_SETTINGS' });
        window.close();
    });
};
// Working
const getAllOwnedCalendars = async () => {
    try {
        // Get auth token
        const token = await chrome.identity.getAuthToken({ interactive: true });
        // Send request to Google Calendar API
        const response = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
            headers: {
                'Authorization': `Bearer ${token.token}`,
                'Content-Type': 'application/json'
            },
        });
        if (response.ok) {
            const data = await response.json();
            const calendars = new Array();
            data.items.forEach(calendar => {
                if (calendar.accessRole === 'owner') {
                    calendars.push({
                        id: calendar.id,
                        name: calendar.summary
                    });
                }
            });
            return calendars;
        }
    } catch (error) {
        console.error(error);
    }
};