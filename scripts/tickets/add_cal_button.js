// TDx Calenedar Management
/* Submission calendar events are modified on submission_watcher.js */
const TICKET = {
    id: null,
    title: null,
    description: null,
    location: null,
    start: null,
    end: null,
    url: null,
    duration: null,
}

async function init() {
    // Set Globals
    TICKET.id = document.querySelector('#btnCopyID > span').textContent || "No ID Provided";
    TICKET.title = document.querySelector('#thTicket_spnTitle').textContent || "No Title Provided";
    TICKET.description = `TDx ${TICKET.id}\n ${(document.querySelector('#ttDescription').textContent).trim()}` || "No Description Provided";
    TICKET.location = document.querySelector("#lblLocation").textContent.trim() || "No Location Provided";
    TICKET.url = window.location.href;
    // Set Dates
    let dateString;
    const onboardingDate = document.querySelector("#divAttribute8727 > div:nth-child(4) > span");
    if (onboardingDate) {
        dateString = dateFixer(onboardingDate.textContent);
    } else {
        dateString = getToday();
    }
    TICKET.start = dateString;
    TICKET.end = addTimeToDate(dateString, SETTINGS.default_duration);
    // Add Calendar Button
    const calendarButton = generateCalendarButton();
    const li = document.createElement('li');
    li.appendChild(calendarButton);
    document.querySelector("#divTabHeader ul").appendChild(li);
}

function submitCalendarEvent() {
    const dateInput = document.querySelector('#eventDate');
    const timeInput = document.querySelector('#eventTime');
    const durationSelect = document.querySelector('#duration');
    // Update Start and End
    TICKET.start = `${dateInput.value} ${addDuration(timeInput.value, 0)}`;
    TICKET.end = `${dateInput.value} ${addDuration(timeInput.value, durationSelect.value)}`;
    const event = {
        title: TICKET.title,
        description: TICKET.description,
        location: TICKET.location,
        start: TICKET.start,
        end: TICKET.end,
        url: window.location.href
    };
    chrome.runtime.sendMessage({ fn: 'ADD_EVENT', event })
        .then(response => {
            console.log(response);
            document.getElementById("calendar-modal").remove();
        }).catch(err => {
            console.error(err);
        })
}

// Element Generation
function generateCalendarButton() {
    const button = document.createElement('button');
    const icon = document.createElement('span');
    icon.className = 'fa-solid fa-calendar';
    button.appendChild(icon);
    button.className = 'btn btn-primary btn-sm';
    button.innerHTML += ' Add to Calendar';
    button.addEventListener("click", (e) => {
        e.preventDefault();
        createPopup();
    });
    return button;
}

function generateContentContainer() {
    const main = document.createElement('div');
    main.style.display = 'flex';
    main.style.flexDirection = 'column';
    return main;
};

function generateDescription() {
    // Create Description
    const desc = document.createElement('textarea');
    desc.value = TICKET.description;
    desc.style.width = '100%';
    desc.style.minHeight = '10rem';
    desc.disabled = true;
    return desc;
}

function generateDialog() {
    const dialog = document.createElement('div');
    dialog.style.display = 'flex';
    dialog.style.flexDirection = 'column';
    dialog.style.justifyContent = 'space-between';
    dialog.style.backgroundColor = 'white';
    dialog.style.margin = 'auto';
    dialog.style.padding = '20px';
    dialog.style.borderRadius = '10px';
    dialog.style.width = '50%';
    dialog.style.height = '50%';
    dialog.style.overflow = 'auto';
    return dialog;
}

function generateFooter() {
    // Button Bar
    const buttonBar = document.createElement('div');
    buttonBar.style.display = 'flex';
    buttonBar.style.justifyContent = 'space-between';
    // Create Cancel Button
    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.className = 'btn btn-danger';
    cancelButton.addEventListener('click', () => {
        document.getElementById("calendar-modal").remove();
    });
    // Create Submit Button
    const submitButton = document.createElement('button');
    submitButton.textContent = 'Submit';
    submitButton.className = 'btn btn-primary';
    submitButton.addEventListener('click', () => { submitCalendarEvent() });
    // Put it all together
    buttonBar.appendChild(cancelButton);
    buttonBar.appendChild(submitButton);
    return buttonBar;
};

function generateForm() {
    // Create Fieldset
    const fieldset = document.createElement('fieldset');
    fieldset.style.display = 'flex';
    fieldset.style.flexDirection = 'column';
    fieldset.style.marginBottom = '1rem';
    // Create date input
    const dateInput = document.createElement('input');
    dateInput.type = 'date';
    dateInput.id = 'eventDate';
    dateInput.required = true;
    dateInput.min = new Date().toISOString().split('T')[0];
    dateInput.style.marginBottom = '0.5rem';
    // Create time input
    const timeInput = document.createElement('input');
    timeInput.type = 'time';
    timeInput.id = 'eventTime';
    timeInput.required = true;
    timeInput.step = 900;
    timeInput.style.marginBottom = '0.5rem';
    // Create duration select
    const durationSelect = document.createElement('select');
    durationSelect.id = 'duration';
    durationSelect.required = true;
    const durations = [15, 30, 45, 60, 90, 120];
    durationSelect.innerHTML = durations.map(duration => `<option value="${duration}">${duration} minutes</option>`).join('');
    durationSelect.value = SETTINGS.default_duration;
    durationSelect.style.marginBottom = '0.5rem';
    // Set Date and Time
    dateInput.value = TICKET.start.split(' ')[0];
    timeInput.value = addDuration(TICKET.start.split(' ')[1], 0);

    // Put it all together
    fieldset.appendChild(dateInput);
    fieldset.appendChild(timeInput);
    fieldset.appendChild(durationSelect);
    return fieldset;

}

function generateHeader() {
    // Container
    const headerContainer = document.createElement('div');
    headerContainer.classList.add('panel-heading', 'clearfix', 'module-header');
    headerContainer.style.cursor = "default";
    // Title
    const title = document.createElement('h2');
    title.style.fontSize = '2.5rem';
    title.classList.add('panel-title', 'pull-left');
    title.textContent = TICKET.title;
    // Close Button
    const closeButton = document.createElement('span');
    closeButton.classList.add('pull-right');
    closeButton.style.cursor = 'pointer';
    closeButton.innerHTML = '<span class="fa-solid fa-xmark fa-lg" aria-hidden="true"></span><span class="sr-only">Close</span>';
    closeButton.addEventListener('click', () => {
        document.getElementById("calendar-modal").remove();
    });
    // Put it all together
    headerContainer.appendChild(closeButton);
    headerContainer.appendChild(title);

    return headerContainer;
}

function generateModal() {
    const modal = document.createElement('div');
    modal.id = 'calendar-modal';
    modal.style.display = 'flex';
    modal.style.position = 'fixed';
    modal.style.zIndex = '100';
    modal.style.left = '0';
    modal.style.top = '0';
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.overflow = 'none';
    modal.style.backgroundColor = 'rgba(0,0,0,0.4)';
    // Close modal on click outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
    return modal;
}


// Element Creation (non-returning)
function createPopup() {
    const modal = generateModal();
    const dialog = generateDialog();
    const content = generateContentContainer();
    const header = generateHeader();
    const form = generateForm();
    const desccription = generateDescription();
    const footer = generateFooter();

    // Put it all together
    content.appendChild(form);
    content.appendChild(desccription);

    dialog.appendChild(header);
    dialog.appendChild(content);
    dialog.appendChild(footer);

    modal.appendChild(dialog);

    document.body.appendChild(modal);
}