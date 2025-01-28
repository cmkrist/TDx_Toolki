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