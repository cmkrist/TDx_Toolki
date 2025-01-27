

const tdxIdElement = document.querySelector('#btnCopyID > span');
const tdxId = tdxIdElement.textContent;

function init() {
    console.log("Add Calendar Button Loaded");
    addCalendarButton();
}

function addCalendarButton() {
    console.log("SUBMITTING");
    const button = document.createElement('button');
    const icon = document.createElement('span');
    icon.className = 'fa-solid fa-calendar';
    button.appendChild(icon);
    button.className = 'btn btn-primary btn-sm';
    button.innerHTML += ' Add to Calendar';
    button.addEventListener("click", (e) => {
        e.preventDefault();
        console.log("Adding to Calendar");
        addToCalendar()
    });
    document.querySelector("#divTabHeader ul").appendChild(button);
}
async function addToCalendar() {
    // Get default calendar
    chrome.runtime.sendMessage({ fn: 'GET_DEFAULT_CALENDAR' }).then((response) => {
        console.log(response);
    });
    // const defaultCalendarId = localStorage.getItem('tdx_calendarId');
    // if (!defaultCalendarId) {
    //     alert('Please select a default calendar in the extension popup');
    //     return;
    // }
    // // Get event details
    const title = document.querySelector("#thTicket_spnTitle").textContent;
    const description = document.querySelector("#ttDescription").textContent;
    
    generateModal(title, description);
}

function generateModal(title, description) {
    // Create modal
    const modal = document.createElement('div');
    modal.style.display = 'flex';
    modal.style.position = 'fixed';
    modal.style.zIndex = '100';
    modal.style.left = '0';
    modal.style.top = '0';
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.overflow = 'none';
    modal.style.backgroundColor = 'rgba(0,0,0,0.4)';
    // Create Dialog
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
    // Create main content
    const main = document.createElement('div');
    main.style.display = 'flex';
    main.style.flexDirection = 'column';
    // Create Title
    const h1 = document.createElement('h1');
    h1.textContent = "Add To Calendar";
    h1.style.textDecoration = 'underline';
    // Create Description
    const desc = document.createElement('textarea');
    desc.value = `TDx ${tdxId}\n ${description}`;
    desc.style.width = '100%';
    desc.style.minHeight = '10rem';
    desc.disabled = true;
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
    timeInput.style.marginBottom = '0.5rem';
    // Create duration select
    const durationSelect = document.createElement('select');
    durationSelect.id = 'duration';
    durationSelect.required = true;
    const durations = [15, 30, 45, 60, 90, 120];
    durationSelect.innerHTML = durations.map(duration => `<option value="${duration}">${duration} minutes</option>`).join('');
    durationSelect.value = 60;
    durationSelect.style.marginBottom = '0.5rem';
    // Set Date and Time
    const dateSel = document.querySelector("#divAttribute8727 > div:nth-child(4) > span");
    const querystr = dateSel.textContent.split(" ");
    const date = querystr[0].split("/");
    let time = querystr[1];
    if(querystr[2] === "PM") {
        // Convert to 24 hour time
        let tmpTime = time.split(":");
        const h = parseInt(tmpTime[0]) + 12;
        time = `${h}:${tmpTime[1]}`;
    } else if (parseInt(time.split(":")[0]) < 10) {
        // Fix for single digit hours
        time = `0${time}`;
    }
    console.log(time);
    dateInput.value = `${date[2]}-${date[0]}-${date[1]}`;
    timeInput.value = time;
    // Put it all together
    fieldset.appendChild(dateInput);
    fieldset.appendChild(timeInput);
    fieldset.appendChild(durationSelect);
    // Button Bar
    const buttonBar = document.createElement('div');
    buttonBar.style.display = 'flex';
    buttonBar.style.justifyContent = 'space-between';
    // Create Cancel Button
    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.className = 'btn btn-danger';
    cancelButton.addEventListener('click', () => {
        modal.remove();
    });
    // Create Submit Button
    const submitButton = document.createElement('button');
    submitButton.textContent = 'Submit';
    submitButton.className = 'btn btn-primary';
    submitButton.addEventListener('click', () => {
        const event = {
            title: title,
            description: `TDx ${tdxId}\n ${description}`,
            location: document.querySelector("#lblLocation").textContent,
            start: new Date(`${dateInput.value}T${timeInput.value}`),
            end: new Date(`${dateInput.value}T${timeInput.value}`),
            url: window.location.href
        };
        console.log(event);
        chrome.runtime.sendMessage({ fn: 'ADD_EVENT', event });
    });
    // Put it all together
    buttonBar.appendChild(cancelButton);
    buttonBar.appendChild(submitButton);
    main.appendChild(fieldset);
    main.appendChild(desc);
    dialog.appendChild(h1);
    dialog.appendChild(main);
    dialog.appendChild(buttonBar);
    modal.appendChild(dialog);
    document.body.appendChild(modal);
}


init();