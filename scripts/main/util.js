// Globals
const SETTINGS = {};

(async () => {
    // Load Settings from storage
    const settings = (await chrome.storage.sync.get('tdx_options')).tdx_options;
    if (!settings) {
        console.error('No settings found');
        return;
    }
    Object.keys(settings).forEach(key => {
        SETTINGS[key] = settings[key];
    });
    // Create the Notifications Element
    const notificationWindow = generateNotificationWindow();
    document.body.appendChild(notificationWindow);
    // Start Local Page Script;
    init();
})();

// Functions
function addDuration(time, duration) {
    // TypeCast
    time = String(time);
    duration = parseInt(duration);
    const [hours, minutes] = time.split(':');
    const totalMinutes = parseInt(hours) * 60 + parseInt(minutes) + parseInt(duration);
    const newHours = doubleDigit(Math.floor(totalMinutes / 60));
    const newMinutes = doubleDigit(totalMinutes % 60);
    return `${newHours}:${newMinutes}`;
}

function addTimeToDate(dateString, mins) {
    // TypeCast
    dateString = String(dateString);
    mins = parseInt(mins);
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
    // TypeCast
    date = String(date);
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

function doubleDigit(num) {
    // TypeCast
    num = parseInt(num);
    return num < 10 ? `0${num}` : num;
}

function getSettings() {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get("tdx_options", (data) => {
            resolve(data.tdx_options);
        });
    })
}

function getToday() {
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
    return `${date[2]}-${date[0]}-${date[1]} ${time}`;
}

function generateNotificationWindow() {
    // Create the Notification Window
    const notificationWindow = document.createElement('div');
    notificationWindow.id = 'notificationWindow';
    notificationWindow.classList.add("btn-primary");
    notificationWindow.style = `
        position: fixed;
        bottom: 1rem;
        right: -100%;
        z-index: 1000;
        padding: 10px;
        border-radius: 5px;
        display: flex;
        flex-flow: column;
        transition: right 0.5s;
        transition: opacity 0.5s;
        opacity: 0;
    `;
    // Create the Header
    const header = document.createElement('div');
    header.style = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;
    `;
    // Create the Title
    const title = document.createElement('h3');
    title.style.color = 'white';
    title.style.fontWeight = 'bold';
    title.innerHTML = 'Placeholder Title';
    // Create the Close Button
    const closeButton = document.createElement('span');
    closeButton.innerHTML = '&times;';
    closeButton.style.cursor = 'pointer';
    closeButton.onclick = () => {
        closeNotification();
    };
    // Create the Message
    const message = document.createElement('p');
    message.id = 'notificationBody';
    message.innerHTML = 'Placeholder Message. This will be replaced by the actual message.';
    // Append Elements
    header.appendChild(title);
    header.appendChild(closeButton);
    notificationWindow.appendChild(header);
    notificationWindow.appendChild(message);
    // Return the Notification Window
    return notificationWindow;
}

const openNotification = (title, message) => {
    const notificationWindow = document.getElementById('notificationWindow');
    console.log(notificationWindow);
    notificationWindow.querySelector("h3").innerHTML = title;
    notificationWindow.querySelector("#notificationBody").innerHTML = message;
    notificationWindow.style.right = '1rem';
    notificationWindow.style.opacity = 1;
}

const closeNotification = () => {
    const notificationWindow = document.getElementById('notificationWindow');
    if(notificationWindow.style.right === '-100%') return;
    notificationWindow.style.right = '-100%';
    notificationWindow.style.opacity = 0;
}

const Notify = (title = "Unset", message = "Unset", time = 15) => {
    time = time*1000;
    openNotification(title, message);
    setTimeout(() => {
        closeNotification();
    }, time);
}