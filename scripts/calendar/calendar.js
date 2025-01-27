const init = async () => {
    const calendarElement = document.getElementById('default-calendar');
    populateCalendars(calendarElement);
    setSaveButtonListener(calendarElement);
};
// Working
const populateCalendars = async (calendarElement) => {
    const calendars = await getAllOwnedCalendars();
    calendarElement.disabled = false;
    calendarElement.innerHTML = calendars.map(calendar => `<option value="${calendar.id}">${calendar.name}</option>`).join('');
    // Set default calendar (if exists)
    const defaultCalendar = (await chrome.storage.sync.get('tdx_calendar')).tdx_calendar;
    if (defaultCalendar) calendarElement.value = defaultCalendar.id;
};
// Working
const setSaveButtonListener = (calendarElement) => {
    const saveButton = document.getElementById('save-button');
    saveButton.addEventListener('click', async () => {
        const Calendar = {
            id: calendarElement.value,
            name: calendarElement.options[calendarElement.selectedIndex].text
        }
        await chrome.storage.sync.set({ 'tdx_calendar': Calendar });
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