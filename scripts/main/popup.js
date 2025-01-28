const init = async () => {
    // Load Settings from storage
    const settings = await chrome.storage.sync.get('tdx_options').tdx_options;
    // Populate Values
    populateCalendars();
    // Set default values
    document.getElementById('auto-schedule').checked = settings.auto_schedule;
    document.getElementById('auto-schedule').disabled = false;
    const defaultCalendar = settings.default_calendar;
    if (defaultCalendar) calendarElement.value = defaultCalendar.id;
    // Event Listeners
    setSaveButtonListener();
};
// Working
const populateCalendars = async () => {
    const calendarElement = document.getElementById('default-calendar');
    const calendars = await getAllOwnedCalendars();
    calendarElement.disabled = false;
    calendarElement.innerHTML = calendars.map(calendar => `<option value="${calendar.id}">${calendar.name}</option>`).join('');
};
// Working
const setSaveButtonListener = (calendarElement) => {
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
        await chrome.storage.sync.set({ 'tdx_calendar': Calendar });
        await crhome.storage.sync.set({ 'tdx_options': { 
            'default_calendar': Calendar,
            'default_duration': 30,
            'default_reminder': 15,
            'default_color': '#000000',
            'auto_schedule': autoScheduleElement.checked
        } });
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
                if(calendar.accessRole === 'owner') {
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

init();