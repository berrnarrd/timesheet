const clockInBtn = document.querySelector('.clock-in-btn');
const clockOutBtn = document.querySelector('.clock-out-btn');
const takeLunchBtn = document.querySelector('.take-lunch-btn');
const endLunchBtn = document.querySelector('.end-lunch-btn');
const addNotesBtn = document.querySelector('.add-notes-btn');
const startTravelBtn = document.querySelector('.start-travel-btn');
const endTravelBtn = document.querySelector('.end-travel-btn');
const timeDisplay = document.querySelector('.time');
const timerStatusDisplay = document.querySelector('.timer-status');
const timerContainer = document.querySelector('.timer-container');
const separator = document.querySelector('.separator');
const timelineWrapper = document.querySelector('.timeline-wrapper');
const timelineContainer = document.querySelector('.timeline-container');
const actionsSeparator = document.querySelector('.actions-separator');
const actionButtons = document.querySelector('.action-buttons');

// Add Notes Modal
const addNotesModal = document.querySelector('.add-notes-modal');
const notesTextarea = document.querySelector('.notes-textarea');
const addNoteBtn = document.querySelector('.add-note-btn');
const cancelNotesBtn = document.querySelector('.cancel-notes-btn');

// Callback In
const callbackInBtn = document.querySelector('.callback-in-btn');
const callbackOutBtn = document.querySelector('.callback-out-btn');

let clockInInterval;
let clockInTime;
let elapsedTime = 0;
let isClockedIn = false;
let isCallbackIn = false;
let isOnBreak = false;
let isTraveling = false;
let lunchStartTime;
let lunchBreakInterval;
let lunchBreakTimeRemaining = 1800000; // 30 minutes in milliseconds
let travelStartTime;
let travelDuration = 0;
let travelInterval;

const formatTime = (time) => {
    const hours = Math.floor(time / 3600000);
    const minutes = Math.floor((time % 3600000) / 60000);
    const seconds = Math.floor((time % 60000) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const formatClockInTime = (date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
};

const showValidationMessage = (message, confirmHandler, cancelHandler) => {
    const validationMessage = document.querySelector('.validation-message');
    const validationMessageText = document.querySelector('.validation-message-text');
    const confirmBtn = document.querySelector('.confirm-btn');
    const cancelBtn = document.querySelector('.cancel-btn');

    validationMessageText.textContent = message;
    validationMessage.classList.remove('hidden');

    const confirmBtnClickHandler = () => {
        confirmHandler();
        validationMessage.classList.add('hidden');
    };

    const cancelBtnClickHandler = () => {
        cancelHandler();
        validationMessage.classList.add('hidden');
    };

    confirmBtn.addEventListener('click', confirmBtnClickHandler, { once: true });
    cancelBtn.addEventListener('click', cancelBtnClickHandler, { once: true });
};

const disableCallbackInButton = () => {
    const currentHour = new Date().getHours();
    if (currentHour >= 12 || currentHour < 6) {
        callbackInBtn.disabled = false; // Button is active
    } else {
        callbackInBtn.disabled = true; // Button is disabled
    }
};

const clockIn = () => {
    showValidationMessage('Clock In?', () => {
        isClockedIn = true;
        clockInTime = new Date();
        clockInBtn.classList.add('hidden');
        callbackInBtn.classList.add('hidden');
        takeLunchBtn.classList.remove('hidden');
        addNotesBtn.classList.remove('hidden');
        startTravelBtn.classList.remove('hidden');
        clockOutBtn.classList.remove('hidden');
        callbackOutBtn.classList.add('hidden');
        timerStatusDisplay.textContent = 'Working';
        timerContainer.classList.add('clocked-in');
        separator.classList.remove('hidden');
        timelineWrapper.classList.remove('hidden');
        actionsSeparator.classList.remove('hidden');
        actionButtons.classList.remove('hidden');

        const clockInTimelineEntry = document.createElement('div');
        clockInTimelineEntry.classList.add('timeline-entry');
        clockInTimelineEntry.innerHTML = `
            <div class="time-label-container">
                <span class="clock-in-time">${formatClockInTime(clockInTime)}</span>
                <span class="timeline-label">Clocked In</span>
            </div>
            <img class="icon" src="images/Clock.svg" alt="Icon">
        `;
        const timeline = document.querySelector('.timeline');
        timeline.prepend(clockInTimelineEntry);

        clearInterval(clockInInterval);
        clockInInterval = setInterval(() => {
            elapsedTime = Date.now() - clockInTime.getTime();
            timeDisplay.textContent = formatTime(elapsedTime);
        }, 1000);
    }, () => { });
};

const clockOut = () => {
    if (isClockedIn) {
        showValidationMessage('Clock Out?', () => {
            isClockedIn = false;
            isOnBreak = false;
            isTraveling = false;
            clearInterval(clockInInterval);
            clearInterval(lunchBreakInterval);
            clearInterval(travelInterval);
            elapsedTime = Date.now() - clockInTime.getTime();
            timeDisplay.textContent = formatTime(elapsedTime);
            clockInBtn.classList.remove('hidden');
            callbackInBtn.classList.remove('hidden');
            takeLunchBtn.classList.add('hidden');
            addNotesBtn.classList.add('hidden');
            startTravelBtn.classList.add('hidden');
            endLunchBtn.classList.add('hidden');
            endTravelBtn.classList.add('hidden');
            clockOutBtn.classList.add('hidden');
            callbackOutBtn.classList.add('hidden');
            elapsedTime = 0;
            timeDisplay.textContent = formatTime(elapsedTime);
            timerStatusDisplay.textContent = 'Ready To Work';
            timerContainer.classList.remove('clocked-in');
            timerContainer.classList.remove('on-break');
            timerContainer.classList.remove('traveling');
            separator.classList.add('hidden');
            timelineWrapper.classList.add('hidden');
            actionsSeparator.classList.add('hidden');
            actionButtons.classList.add('hidden');

            const timeline = document.querySelector('.timeline');
            timeline.innerHTML = '';
        }, () => { });
    }
};

const takeLunch = () => {
    if (!isOnBreak) {
        showValidationMessage('Start Lunch?', () => {
            isOnBreak = true;
            lunchStartTime = new Date();

            const lunchStartTimelineEntry = document.createElement('div');
            lunchStartTimelineEntry.classList.add('timeline-entry');
            lunchStartTimelineEntry.innerHTML = `
                <div class="time-label-container">
                    <span class="lunch-start-time">${formatClockInTime(lunchStartTime)}</span>
                    <span class="timeline-label">Started Lunch Break</span>
                </div>
                <img class="icon" src="images/Lunch.svg" alt="Icon">
            `;
            const timeline = document.querySelector('.timeline');
            timeline.prepend(lunchStartTimelineEntry);

            endLunchBtn.classList.remove('hidden');
            takeLunchBtn.classList.add('hidden');
            timerStatusDisplay.textContent = 'On Break';
            timerContainer.classList.remove('clocked-in');
            timerContainer.classList.add('on-break');
            timeDisplay.textContent = '00:30:00';
            lunchBreakTimeRemaining = 1800000; // Reset the lunch break time remaining

            clearInterval(clockInInterval);
            clearInterval(lunchBreakInterval);
            lunchBreakInterval = setInterval(() => {
                lunchBreakTimeRemaining -= 1000;
                timeDisplay.textContent = formatTime(lunchBreakTimeRemaining);
                if (lunchBreakTimeRemaining <= 0) {
                    clearInterval(lunchBreakInterval);
                    isOnBreak = false;
                    timerStatusDisplay.textContent = 'Working';
                    timerContainer.classList.remove('on-break');
                    timerContainer.classList.add('clocked-in');
                    timeDisplay.textContent = formatTime(elapsedTime);
                    clockInInterval = setInterval(() => {
                        elapsedTime = Date.now() - clockInTime.getTime();
                        timeDisplay.textContent = formatTime(elapsedTime);
                    }, 1000);
                }
            }, 1000);
        }, () => { });
    }
};

const endLunch = () => {
    if (isOnBreak) {
        showValidationMessage('End Lunch?', () => {
            isOnBreak = false;
            clearInterval(lunchBreakInterval);
            const lunchEndTime = new Date();

            const lunchEndTimelineEntry = document.createElement('div');
            lunchEndTimelineEntry.classList.add('timeline-entry');
            lunchEndTimelineEntry.innerHTML = `
                <div class="time-label-container">
                    <span class="lunch-end-time">${formatClockInTime(lunchEndTime)}</span>
                    <span class="timeline-label">Ended Lunch Break</span>
                </div>
                <img class="icon" src="images/Lunch.svg" alt="Icon">
            `;
            const timeline = document.querySelector('.timeline');
            timeline.prepend(lunchEndTimelineEntry);

            endLunchBtn.classList.add('hidden');
            timerStatusDisplay.textContent = 'Working';
            timerContainer.classList.remove('on-break');
            timerContainer.classList.add('clocked-in');
            timeDisplay.textContent = formatTime(elapsedTime);
            clockInInterval = setInterval(() => {
                elapsedTime = Date.now() - clockInTime.getTime();
                timeDisplay.textContent = formatTime(elapsedTime);
            }, 1000);
        }, () => { });
    }
};

const startTravel = () => {
    if (isClockedIn || isCallbackIn && !isTraveling) {
        showValidationMessage('Start Travel?', () => {
            isTraveling = true;
            travelStartTime = new Date();
            startTravelBtn.classList.add('hidden');
            endTravelBtn.classList.remove('hidden');
            timerStatusDisplay.textContent = 'Traveling';
            timerContainer.classList.remove('clocked-in');
            timerContainer.classList.add('traveling');

            const travelStartTimelineEntry = document.createElement('div');
            travelStartTimelineEntry.classList.add('timeline-entry');
            travelStartTimelineEntry.innerHTML = `
                <div class="time-label-container">
                    <span class="travel-start-time">${formatClockInTime(travelStartTime)}</span>
                    <span class="timeline-label">Started Travel</span>
                </div>
                <img class="icon" src="images/Travel.svg" alt="Icon">
            `;
            const timeline = document.querySelector('.timeline');
            timeline.prepend(travelStartTimelineEntry);

            clearInterval(clockInInterval);
            travelInterval = setInterval(() => {
                travelDuration = Date.now() - travelStartTime.getTime();
                timeDisplay.textContent = formatTime(travelDuration);
            }, 1000);
        }, () => { });
    }
};

const endTravel = () => {
    if (isClockedIn || isCallbackIn && isTraveling) {
        showValidationMessage('End Travel?', () => {
            isTraveling = false;
            const travelEndTime = new Date();
            startTravelBtn.classList.remove('hidden');
            endTravelBtn.classList.add('hidden');
            timerStatusDisplay.textContent = 'Working';
            timerContainer.classList.remove('traveling');
            timerContainer.classList.add('clocked-in');

            const travelEndTimelineEntry = document.createElement('div');
            travelEndTimelineEntry.classList.add('timeline-entry');
            travelEndTimelineEntry.innerHTML = `
                <div class="time-label-container">
                    <span class="travel-end-time">${formatClockInTime(travelEndTime)}</span>
                    <span class="timeline-label">Ended Travel (Duration: ${formatTime(travelDuration)})</span>
                </div>
                <img class="icon" src="images/Travel.svg" alt="Icon">
            `;
            const timeline = document.querySelector('.timeline');
            timeline.prepend(travelEndTimelineEntry);

            clearInterval(travelInterval);
            clockInInterval = setInterval(() => {
                elapsedTime = Date.now() - clockInTime.getTime();
                timeDisplay.textContent = formatTime(elapsedTime);
            }, 1000);
        }, () => { });
    }
};

// Add Notes Functionality
addNotesBtn.addEventListener('click', () => {
    if (isClockedIn || isCallbackIn) {
        addNotesModal.classList.remove('hidden');
    }
});

addNotesBtn.classList.add('hidden');

addNoteBtn.addEventListener('click', () => {
    const notes = notesTextarea.value.trim();
    if (notes) {
        const notesTimelineEntry = document.createElement('div');
        notesTimelineEntry.classList.add('timeline-entry');
        notesTimelineEntry.innerHTML = `
            <div class="time-label-container">
                <span class="notes-time">${formatClockInTime(new Date())}</span>
                <span class="timeline-label">Notes:</span>
                <span class="notes-text">${notes}</span>
            </div>
            <img class="icon" src="images/Notes.svg" alt="Icon">
        `;
        const timeline = document.querySelector('.timeline');
        timeline.prepend(notesTimelineEntry);

        addNotesModal.classList.add('hidden');
        notesTextarea.value = '';
    }
});

cancelNotesBtn.addEventListener('click', () => {
    addNotesModal.classList.add('hidden');
    notesTextarea.value = '';
});

// Callback In
const callbackIn = () => {
    showValidationMessage('Callback In?', () => {
        isCallbackIn = true;
        clockInTime = new Date();
        clockInBtn.classList.add('hidden');
        callbackInBtn.classList.add('hidden');
        takeLunchBtn.classList.remove('hidden');
        addNotesBtn.classList.remove('hidden');
        startTravelBtn.classList.remove('hidden');
        clockOutBtn.classList.add('hidden');
        callbackOutBtn.classList.remove('hidden');
        timerStatusDisplay.textContent = 'Callback In';
        timerContainer.classList.add('clocked-in');
        separator.classList.remove('hidden');
        timelineWrapper.classList.remove('hidden');
        actionsSeparator.classList.remove('hidden');
        actionButtons.classList.remove('hidden');

        const clockInTimelineEntry = document.createElement('div');
        clockInTimelineEntry.classList.add('timeline-entry');
        clockInTimelineEntry.innerHTML = `
            <div class="time-label-container">
                <span class="clock-in-time">${formatClockInTime(clockInTime)}</span>
                <span class="timeline-label">Callback In</span>
            </div>
            <img class="icon" src="images/Clock.svg" alt="Icon">
        `;
        const timeline = document.querySelector('.timeline');
        timeline.prepend(clockInTimelineEntry);

        clearInterval(clockInInterval);
        clockInInterval = setInterval(() => {
            elapsedTime = Date.now() - clockInTime.getTime();
            timeDisplay.textContent = formatTime(elapsedTime);
        }, 1000);
    }, () => { });
};

const callbackOut = () => {
    if (isCallbackIn) {
        showValidationMessage('Callback Out?', () => {
            isCallbackIn = false;
            isOnBreak = false;
            isTraveling = false;
            clearInterval(clockInInterval);
            clearInterval(lunchBreakInterval);
            clearInterval(travelInterval);
            elapsedTime = Date.now() - clockInTime.getTime();
            timeDisplay.textContent = formatTime(elapsedTime);
            clockInBtn.classList.remove('hidden');
            callbackInBtn.classList.remove('hidden');
            takeLunchBtn.classList.add('hidden');
            addNotesBtn.classList.add('hidden');
            startTravelBtn.classList.add('hidden');
            endLunchBtn.classList.add('hidden');
            endTravelBtn.classList.add('hidden');
            clockOutBtn.classList.add('hidden');
            callbackOutBtn.classList.add('hidden');
            elapsedTime = 0;
            timeDisplay.textContent = formatTime(elapsedTime);
            timerStatusDisplay.textContent = 'Ready To Work';
            timerContainer.classList.remove('clocked-in');
            timerContainer.classList.remove('on-break');
            timerContainer.classList.remove('traveling');
            separator.classList.add('hidden');
            timelineWrapper.classList.add('hidden');
            actionsSeparator.classList.add('hidden');
            actionButtons.classList.add('hidden');

            const timeline = document.querySelector('.timeline');
            timeline.innerHTML = '';
        }, () => { });
    }
};

clockInBtn.addEventListener('click', clockIn);
clockOutBtn.addEventListener('click', clockOut);
callbackInBtn.addEventListener('click', callbackIn);
callbackOutBtn.addEventListener('click', callbackOut);
takeLunchBtn.addEventListener('click', takeLunch);
endLunchBtn.addEventListener('click', endLunch);
startTravelBtn.addEventListener('click', startTravel);
endTravelBtn.addEventListener('click', endTravel);

// Call the disableCallbackInButton function periodically
setInterval(disableCallbackInButton, 60000); // Check every minute
disableCallbackInButton(); // Check on page load