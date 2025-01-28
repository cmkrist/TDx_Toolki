// Add to calendar on TDx ticket submission
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

async function init() {
    // Insert the auto schedule checkbox
    document.getElementById("NewStatusId").parentElement.appendChild(generateAutoSchedule());
    console.log("Submission Watcher Loaded : " + tdxId);
    document.getElementById("NewStatusId").addEventListener("change", function () {
        const statusId = this.value;
        const statusName = StatusIDs[statusId];
        if (statusId === "86") {
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
            if (document.getElementById("auto-schedule").checked === false) return;
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

function generateAutoSchedule() {
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