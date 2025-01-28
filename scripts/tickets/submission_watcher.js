// Add to calendar on TDx ticket submission
const SETTINGS = {};
const tdxIdElement = document.querySelector('#btnCopyID > span');
const tdxId = tdxIdElement.textContent;
const title = document.querySelector("h1").textContent.trim();
const StatusIDs = {
    "77": "New",
    "78": "Open",
    "79": "In Process",
    "84": "Awaiting User Info",
    "85": "Awaiting Third Party",
    "86": "Scheduled",
    "81": "Closed",
    "82": "Canceled"
}

function doubleDigit(num) {
    return num < 10 ? `0${num}` : num;
}

function addDuration(time, duration) {
    const [hours, minutes] = time.split(':');
    const totalMinutes = parseInt(hours) * 60 + parseInt(minutes) + parseInt(duration);
    const newHours = doubleDigit(Math.floor(totalMinutes / 60));
    const newMinutes = doubleDigit(totalMinutes % 60);
    newMinutes = newMinutes < 10 ? `0${newMinutes}` : newMinutes;
    return `${newHours}:${newMinutes}`;
}

function addTimeToDate(dateString, mins) {
    const dateSplit = dateString.split(" ");
    const date = dateSplit[0];
    const time = dateSplit[1];
    const [hours, minutes] = time.split(":");
    const totalMinutes = parseInt(hours) * 60 + parseInt(minutes) + parseInt(mins);
    const newHours = doubleDigit(Math.floor(totalMinutes / 60));
    const newMinutes = doubleDigit(totalMinutes % 60);
    return `${date} ${newHours}:${newMinutes}`;
}

function dateFixer(date) {
    const dth = date.split(" ");
    // Fix the date
    const dateArr = dth[0].split("/");
    const month = doubleDigit(dateArr[0]);
    const day = doubleDigit(dateArr[1]);
    const year = dateArr[2];
    // Fix the time
    const ampm = dth[2] || "AM";
    const timeArr = dth[1].split(":");
    const hour = (ampm === "PM" ? parseInt(timeArr[0]) + 12 : doubleDigit(timeArr[0]));
    const minute = doubleDigit(timeArr[1]);
    return `${year}-${month}-${day} ${hour}:${minute}`;
}

async function init() {
    // Load settings from storage
    const settings = await new Promise((resolve, reject) => {
        chrome.storage.sync.get("tdx_options", (data) => {
            resolve(data.tdx_options);
        });
    });
    Object.keys(settings).forEach(key => {
        SETTINGS[key] = settings[key];
    });
    // Insert the auto schedule checkbox
    document.getElementById("NewStatusId").parentElement.appendChild(generateAutoSchedule());
    console.log("Submission Watcher Loaded : " + tdxId);
    document.getElementById("NewStatusId").addEventListener("change", function () {
        const statusId = this.value;
        const statusName = StatusIDs[statusId];
        if(statusId === "86") {
            document.getElementById("auto-schedule-container").style.display = "block";
        } else {
            document.getElementById("auto-schedule-container").style.display = "none";
        }
    });
    document.getElementById("NewStatusId").value === "86" ? document.getElementById("auto-schedule-container").style.display = "block" : document.getElementById("auto-schedule-container").style.display = "none";
    watchForSubmissions();
}
function watchForSubmissions() {
    // Look for element with tdx_tag
    if (tdxIdElement) {
        // Watch for all form submissions on the page
        document.addEventListener('submit', function (event) {
            if(document.getElementById("auto-schedule").checked === false) return;
            const formData = new FormData(event.target);
            const data = {};

            // Convert FormData to object
            for (const [key, value] of formData.entries()) {
                data[key] = value;
            }
            // Send data to background script
            chrome.runtime.sendMessage({
                fn: 'FORM_SUBMISSION',
                data: {
                    tdxId,
                    title,
                    description: data["Comments.Content"],
                    start: dateFixer(data.NewGoesOffHoldDate),
                    end: addTimeToDate(dateFixer(data.NewGoesOffHoldDate), SETTINGS.default_duration),
                    url: window.location.href.replace("Update", "TicketDet")
                    }
            });
        });
    }
}

function generateAutoSchedule () {
    const autoSchedule = document.createElement('div');
    autoSchedule.classList.add('form-group');
    autoSchedule.style.display = "none";
    autoSchedule.id = "auto-schedule-container";
    const label = document.createElement('label');
    label.textContent = "Auto Schedule";
    label.style.marginLeft = "1rem";
    const input = document.createElement('input');
    input.type = "checkbox";
    input.id = "auto-schedule";
    input.checked = SETTINGS.auto_schedule;
    autoSchedule.appendChild(input);
    autoSchedule.appendChild(label);
    return autoSchedule;
}
init();