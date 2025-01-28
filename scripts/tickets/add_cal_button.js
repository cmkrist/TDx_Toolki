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

function init() {
    // Set Globals
    TICKET.id = document.querySelector('#btnCopyID > span').textContent;
    TICKET.title = document.querySelector('#thTicket_spnTitle').textContent;
    TICKET.description = `TDx ${TICKET.id}\n ${(document.querySelector('#ttDescription').textContent).trim()}`;
    TICKET.location = document.querySelector("#lblLocation").textContent.trim();
    TICKET.url = window.location.href;
    // Set Dates
    let date, time;
    const onboardingDate = document.querySelector("#divAttribute8727 > div:nth-child(4) > span");
    if (onboardingDate) {
        console.log("A");
        const querystr = onboardingDate.textContent.split(" ");
        date = querystr[0].split("/");
        time = querystr[1];
        console.log("A");
        if (querystr[2] === "PM") {
            // Convert to 24 hour time
            let tmpTime = time.split(":");
            const h = parseInt(tmpTime[0]) + 12;
            time = `${h}:${tmpTime[1]}`;
        } else if (parseInt(time.split(":")[0]) < 10) {
            // Fix for single digit hours
            time = `0${time}`;
        }
        console.log("A");
    } else {
        // Set time to now
        const now = new Date();
        const hours = now.getHours();
        let minutes = now.getMinutes();
        const remainder = minutes % 15;
        minutes = minutes + (remainder < 8 ? -remainder : 15 - remainder);
        time = addDuration(`${hours}:${minutes}`, 0);
        // Set date to today
        const year = now.getFullYear();
        let month = now.getMonth() + 1;
        let day = now.getDate();
        // Fix for single digit months and days
        month = month < 10 ? `0${month}` : month;
        day = day < 10 ? `0${day}` : day;
        date = [month, day, year];
    }
    TICKET.start = `${date[2]}-${date[0]}-${date[1]} ${time}`;
    TICKET.end = `${date[2]}-${date[0]}-${date[1]} ${addDuration(time, 60)}`;
    console.log(TICKET);
    // Add Calendar Button
    const calendarButton = generateCalendarButton();
    document.querySelector("#divTabHeader ul").appendChild(calendarButton);
}
// Utility Functions
function addDuration(time, duration) {
    const [hours, minutes] = time.split(':');
    const totalMinutes = parseInt(hours) * 60 + parseInt(minutes) + parseInt(duration);
    let newHours = Math.floor(totalMinutes / 60);
    newHours = newHours < 10 ? `0${newHours}` : newHours;
    let newMinutes = totalMinutes % 60;
    newMinutes = newMinutes < 10 ? `0${newMinutes}` : newMinutes;
    return `${newHours}:${newMinutes}`;
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
    console.log(event);
    chrome.runtime.sendMessage({ fn: 'ADD_EVENT', event });
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
        modal.remove();
    });
    // Create Submit Button
    const submitButton = document.createElement('button');
    submitButton.textContent = 'Submit';
    submitButton.className = 'btn btn-primary';
    submitButton.addEventListener('click', ()=> {submitCalendarEvent()});
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
    durationSelect.value = 60;
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



/* 

<div id="195963" class="desktop-module panel panel-default gutter-top report-module">
  <div class="panel-heading clearfix draggable module-header ui-sortable-handle">
    <h4 class="panel-title pull-left">Last Response Wasn't Me</h4>
    <div class="pull-right"><a title="View Details" href="/TDNext/Apps/Reporting/ReportDetail?ID=22699" onclick="return openWinHref(event, 992, 700, 'ReportViewer22699');">
        <span class="fa-solid fa-info-circle fa-lg" aria-hidden="true"></span><span class="sr-only">View Details for Last Response Wasn't Me</span><span class="sr-only">Clicking will open a new window.</span></a><a title="Refresh (auto-refreshed every 60 seconds)" tabindex="0" role="button" href="javascript:refreshModule('195963');" class="js-module-refresh-button">
        <span class="fa-solid fa-refresh fa-lg refresh-module-icon" aria-hidden="true"></span>
        <span class="fa-solid fa-ban superscript" style="display: none;" aria-hidden="true"></span>
        <span class="sr-only">Refresh Last Response Wasn't Me</span></a><a title="Remove" role="button" tabindex="0" href="javascript:removeModule('195963');">
        <span class="fa-solid fa-xmark fa-lg" aria-hidden="true"></span><span class="sr-only">Remove Last Response Wasn't Me from desktop</span></a></div>
  </div>
  <div class="ModuleContent">
    <div aria-live="polite">
      <table id="table22699" border="0" cellpadding="6" cellspacing="0" class="report-viewer table table-striped gutter-bottom-none">
        <thead>
          <tr class="TDGridHeader">
            <th style="white-space: nowrap; text-align: Left;"><a class="sort-link" href="javascript:;" data-sort="TicketID DESC">ID
                <span class="fa-solid fa-sort gutter-left-xs" aria-hidden="true"></span>
                <span class="sr-only">Sort by ID</span>
              </a></th>
            <th style="white-space: nowrap; text-align: Left;"><a class="sort-link" href="javascript:;" data-sort="Title">Title
                <span class="fa-solid fa-sort gutter-left-xs" aria-hidden="true"></span>
                <span class="sr-only">Sort by Title</span>
              </a></th>
            <th style="white-space: nowrap; text-align: Left;"><a class="sort-link" href="javascript:;" data-sort="ClassificationName">Classification
                <span class="fa-solid fa-sort gutter-left-xs" aria-hidden="true"></span>
                <span class="sr-only">Sort by Classification</span>
              </a></th>
            <th style="white-space: nowrap; text-align: Left;"><a class="sort-link" href="javascript:;" data-sort="CustomerName">Requestor
                <span class="fa-solid fa-sort gutter-left-xs" aria-hidden="true"></span>
                <span class="sr-only">Sort by Requestor</span>
              </a></th>
            <th style="white-space: nowrap; text-align: Left;"><a class="sort-link" href="javascript:;" data-sort="AccountName">Acct/Dept
                <span class="fa-solid fa-sort gutter-left-xs" aria-hidden="true"></span>
                <span class="sr-only">Sort by Acct/Dept</span>
              </a></th>
            <th style="white-space: nowrap; text-align: Left;"><a class="sort-link" href="javascript:;" data-sort="TypeName">Type
                <span class="fa-solid fa-sort gutter-left-xs" aria-hidden="true"></span>
                <span class="sr-only">Sort by Type</span>
              </a></th>
            <th style="white-space: nowrap; text-align: Left;"><a class="sort-link" href="javascript:;" data-sort="StatusName">Status
                <span class="fa-solid fa-sort gutter-left-xs" aria-hidden="true"></span>
                <span class="sr-only">Sort by Status</span>
              </a></th>
            <th style="white-space: nowrap; text-align: Left;"><a class="sort-link" href="javascript:;" data-sort="PriorityOrder">Priority
                <span class="fa-solid fa-sort gutter-left-xs" aria-hidden="true"></span>
                <span class="sr-only">Sort by Priority</span>
              </a></th>
            <th style="white-space: nowrap; text-align: Left;"><a class="sort-link" href="javascript:;" data-sort="ResponsibleGroupName">Resp Group
                <span class="fa-solid fa-sort gutter-left-xs" aria-hidden="true"></span>
                <span class="sr-only">Sort by Resp Group</span>
              </a></th>
            <th style="white-space: nowrap; text-align: Left;"><a class="sort-link" href="javascript:;" data-sort="ResponsibleFullName">Prim Resp
                <span class="fa-solid fa-sort gutter-left-xs" aria-hidden="true"></span>
                <span class="sr-only">Sort by Prim Resp</span>
              </a></th>
            <th style="white-space: nowrap; text-align: Left;"><a class="sort-link" href="javascript:;" data-sort="DueDate">Due
                <span class="fa-solid fa-sort gutter-left-xs" aria-hidden="true"></span>
                <span class="sr-only">Sort by Due</span>
              </a></th>
            <th style="white-space: nowrap; text-align: Left;"><a class="sort-link" href="javascript:;" data-sort="LastModifiedDate DESC">Modified
                <span class="fa-solid fa-sort gutter-left-xs" aria-hidden="true"></span>
                <span class="sr-only">Sort by Modified</span>
              </a></th>
          </tr>
        </thead>
        <tbody>

          <tr onclick="$('#table22699 tr.hilite').removeClass('hilite');$(this).addClass('hilite');">
            <td><a href="https://teamdynamix.umich.edu/TDNext/Apps/31/Tickets/TicketDet.aspx?TicketID=7710199" onclick="return openWinHref(event, 992, 800, 'TicketDet7710199');">7710199</a></td>
            <td><a href="https://teamdynamix.umich.edu/TDNext/Apps/31/Tickets/TicketDet.aspx?TicketID=7710199" onclick="return openWinHref(event, 992, 800, 'TicketDet7710199');">C2/NQ - DELIVERY - UMSI - MiWorkspace Hardware Repair Request</a></td>
            <td>Request</td>
            <td><a href="https://teamdynamix.umich.edu/TDNext/Apps/Shared/ContactInfo.aspx?U=20c55761-d670-ea11-a81b-000d3a8e391e" onclick="return openWinHref(event, 992, 700, 'ContactInfo20c55761-d670-ea11-a81b-000d3a8e391e');">Aaron Soule</a></td>
            <td><a href="https://teamdynamix.umich.edu/TDNext/Apps/Shared/AccountDetail.aspx?CACID=3195" onclick="return openWinHref(event, 992, 700, 'Acct/Dept3195');">ITS SS MiWorkspace 481440</a></td>
            <td>MiWorkspace</td>
            <td>In Process</td>
            <td>Low</td>
            <td style="white-space: nowrap;">ITS-NITCentral2</td>
            <td><a href="https://teamdynamix.umich.edu/TDNext/Apps/People/PersonDet.aspx?U=802ae5e6-d811-ed11-bd6e-e42aac733eb4" onclick="return openWinHref(event, 992, 700, 'PersonDet802ae5e6-d811-ed11-bd6e-e42aac733eb4');">Cody Krist</a></td>
            <td></td>
            <td>Tue 1/28/25 8:30 AM</td>
          </tr>

          <tr onclick="$('#table22699 tr.hilite').removeClass('hilite');$(this).addClass('hilite');">
            <td><a href="https://teamdynamix.umich.edu/TDNext/Apps/31/Tickets/TicketDet.aspx?TicketID=7710941" onclick="return openWinHref(event, 992, 800, 'TicketDet7710941');">7710941</a></td>
            <td><a href="https://teamdynamix.umich.edu/TDNext/Apps/31/Tickets/TicketDet.aspx?TicketID=7710941" onclick="return openWinHref(event, 992, 800, 'TicketDet7710941');">**IN SHOP** MIWS C2/NQ-&gt;Tech - ITS-MiWorkspace Hardware Repair Request</a></td>
            <td>Request</td>
            <td><a href="https://teamdynamix.umich.edu/TDNext/Apps/Shared/ContactInfo.aspx?U=20c55761-d670-ea11-a81b-000d3a8e391e" onclick="return openWinHref(event, 992, 700, 'ContactInfo20c55761-d670-ea11-a81b-000d3a8e391e');">Aaron Soule</a></td>
            <td><a href="https://teamdynamix.umich.edu/TDNext/Apps/Shared/AccountDetail.aspx?CACID=3195" onclick="return openWinHref(event, 992, 700, 'Acct/Dept3195');">ITS SS MiWorkspace 481440</a></td>
            <td>MiWorkspace</td>
            <td>In Process</td>
            <td>Low</td>
            <td style="white-space: nowrap;">ITS-NITCentral2</td>
            <td><a href="https://teamdynamix.umich.edu/TDNext/Apps/People/PersonDet.aspx?U=802ae5e6-d811-ed11-bd6e-e42aac733eb4" onclick="return openWinHref(event, 992, 700, 'PersonDet802ae5e6-d811-ed11-bd6e-e42aac733eb4');">Cody Krist</a></td>
            <td></td>
            <td>Mon 1/27/25 12:01 AM</td>
          </tr>

          <tr onclick="$('#table22699 tr.hilite').removeClass('hilite');$(this).addClass('hilite');">
            <td><a href="https://teamdynamix.umich.edu/TDNext/Apps/31/Tickets/TicketDet.aspx?TicketID=7744495" onclick="return openWinHref(event, 992, 800, 'TicketDet7744495');">7744495</a></td>
            <td><a href="https://teamdynamix.umich.edu/TDNext/Apps/31/Tickets/TicketDet.aspx?TicketID=7744495" onclick="return openWinHref(event, 992, 800, 'TicketDet7744495');">MiWorkspace; Neighborhood IT Compuer went blank and now is stuck in repair/troubleshoot loop.</a></td>
            <td>Request</td>
            <td><a href="https://teamdynamix.umich.edu/TDNext/Apps/Shared/ContactInfo.aspx?U=313d919d-dd70-ea11-a81b-000d3a8e391e" onclick="return openWinHref(event, 992, 700, 'ContactInfo313d919d-dd70-ea11-a81b-000d3a8e391e');">Gabriella Boufford</a></td>
            <td><a href="https://teamdynamix.umich.edu/TDNext/Apps/Shared/AccountDetail.aspx?CACID=3282" onclick="return openWinHref(event, 992, 700, 'Acct/Dept3282');">CEW 516100</a></td>
            <td>MiWorkspace</td>
            <td>In Process</td>
            <td>Low</td>
            <td style="white-space: nowrap;">ITS-NITCentral2</td>
            <td><a href="https://teamdynamix.umich.edu/TDNext/Apps/People/PersonDet.aspx?U=802ae5e6-d811-ed11-bd6e-e42aac733eb4" onclick="return openWinHref(event, 992, 700, 'PersonDet802ae5e6-d811-ed11-bd6e-e42aac733eb4');">Cody Krist</a></td>
            <td></td>
            <td>Mon 1/27/25 10:22 AM</td>
          </tr>

          <tr onclick="$('#table22699 tr.hilite').removeClass('hilite');$(this).addClass('hilite');">
            <td><a href="https://teamdynamix.umich.edu/TDNext/Apps/31/Tickets/TicketDet.aspx?TicketID=7768556" onclick="return openWinHref(event, 992, 800, 'TicketDet7768556');">7768556</a></td>
            <td><a href="https://teamdynamix.umich.edu/TDNext/Apps/31/Tickets/TicketDet.aspx?TicketID=7768556" onclick="return openWinHref(event, 992, 800, 'TicketDet7768556');">C2/NQ - DELIVERY - MiWorkspace Refresh Ticket From Otto</a></td>
            <td>Request</td>
            <td><a href="https://teamdynamix.umich.edu/TDNext/Apps/Shared/ContactInfo.aspx?U=d952d7f5-c670-ea11-a81b-000d3a8e391e" onclick="return openWinHref(event, 992, 700, 'ContactInfod952d7f5-c670-ea11-a81b-000d3a8e391e');">Gayle Rosen</a></td>
            <td><a href="https://teamdynamix.umich.edu/TDNext/Apps/Shared/AccountDetail.aspx?CACID=3506" onclick="return openWinHref(event, 992, 700, 'Acct/Dept3506');">Student Legal Services 600191</a></td>
            <td>MiWorkspace</td>
            <td>In Process</td>
            <td>Low</td>
            <td style="white-space: nowrap;">ITS-NITCentral2</td>
            <td><a href="https://teamdynamix.umich.edu/TDNext/Apps/People/PersonDet.aspx?U=802ae5e6-d811-ed11-bd6e-e42aac733eb4" onclick="return openWinHref(event, 992, 700, 'PersonDet802ae5e6-d811-ed11-bd6e-e42aac733eb4');">Cody Krist</a></td>
            <td></td>
            <td>Mon 1/27/25 12:42 PM</td>
          </tr>

          <tr onclick="$('#table22699 tr.hilite').removeClass('hilite');$(this).addClass('hilite');">
            <td><a href="https://teamdynamix.umich.edu/TDNext/Apps/31/Tickets/TicketDet.aspx?TicketID=7772587" onclick="return openWinHref(event, 992, 800, 'TicketDet7772587');">7772587</a></td>
            <td><a href="https://teamdynamix.umich.edu/TDNext/Apps/31/Tickets/TicketDet.aspx?TicketID=7772587" onclick="return openWinHref(event, 992, 800, 'TicketDet7772587');">Laptop Microphone Not Picking up Audio</a></td>
            <td>Request</td>
            <td><a href="https://teamdynamix.umich.edu/TDNext/Apps/Shared/ContactInfo.aspx?U=68414885-d670-ea11-a81b-000d3a8e391e" onclick="return openWinHref(event, 992, 700, 'ContactInfo68414885-d670-ea11-a81b-000d3a8e391e');">Alexandra Haddad</a></td>
            <td><a href="https://teamdynamix.umich.edu/TDNext/Apps/Shared/AccountDetail.aspx?CACID=2945" onclick="return openWinHref(event, 992, 700, 'Acct/Dept2945');">Graham Sustainability Inst. 435113</a></td>
            <td>MiWorkspace</td>
            <td>In Process</td>
            <td>Low</td>
            <td style="white-space: nowrap;">ITS-NITCentral2</td>
            <td><a href="https://teamdynamix.umich.edu/TDNext/Apps/People/PersonDet.aspx?U=802ae5e6-d811-ed11-bd6e-e42aac733eb4" onclick="return openWinHref(event, 992, 700, 'PersonDet802ae5e6-d811-ed11-bd6e-e42aac733eb4');">Cody Krist</a></td>
            <td></td>
            <td>Mon 1/27/25 9:33 AM</td>
          </tr>

          <tr onclick="$('#table22699 tr.hilite').removeClass('hilite');$(this).addClass('hilite');">
            <td><a href="https://teamdynamix.umich.edu/TDNext/Apps/31/Tickets/TicketDet.aspx?TicketID=7800603" onclick="return openWinHref(event, 992, 800, 'TicketDet7800603');">7800603</a></td>
            <td><a href="https://teamdynamix.umich.edu/TDNext/Apps/31/Tickets/TicketDet.aspx?TicketID=7800603" onclick="return openWinHref(event, 992, 800, 'TicketDet7800603');">MiWorkspace Refresh Ticket From Otto</a></td>
            <td>Request</td>
            <td><a href="https://teamdynamix.umich.edu/TDNext/Apps/Shared/ContactInfo.aspx?U=1e6f5a85-a071-ea11-a81b-000d3a8e391e" onclick="return openWinHref(event, 992, 700, 'ContactInfo1e6f5a85-a071-ea11-a81b-000d3a8e391e');">Mary Kay Phelps</a></td>
            <td><a href="https://teamdynamix.umich.edu/TDNext/Apps/Shared/AccountDetail.aspx?CACID=2945" onclick="return openWinHref(event, 992, 700, 'Acct/Dept2945');">Graham Sustainability Inst. 435113</a></td>
            <td>MiWorkspace</td>
            <td>In Process</td>
            <td>Low</td>
            <td style="white-space: nowrap;">ITS-NITCentral2</td>
            <td><a href="https://teamdynamix.umich.edu/TDNext/Apps/People/PersonDet.aspx?U=802ae5e6-d811-ed11-bd6e-e42aac733eb4" onclick="return openWinHref(event, 992, 700, 'PersonDet802ae5e6-d811-ed11-bd6e-e42aac733eb4');">Cody Krist</a></td>
            <td></td>
            <td>Tue 1/28/25 12:02 AM</td>
          </tr>

        </tbody>
      </table>
    </div>
  </div>
</div>

*/

init();