/**
 * 
 * Settings is a global state with setting helpers.
 * - The values are default and meant to be overridden if other saved settings found in localStorage
 * - lastUpdated tracks the Unix time last saved, which helps the browser decide whether to re-render.
 * - Never modify the values in [0] directly. Use save() method so that lastUpdated can refresh.
 * 
 */
window.settings = {
    lastUpdated: 0,
    save: function() {
        this.lastUpdated = Date.now();
    },
    0: {
        timeWakeUpBy: "0600",
        durationSleepToWake: 8,
        steps: {
            first: "Begin",
            optional: [],
            last: "Fall asleep",
        }
    }
}

/**
 * Utility functions
 */
window.utility = {
    validateMilitaryTime: (militaryTime) => {
        let firstPass = typeof militaryTime==="string" && militaryTime.length===4,
            secondPass = parseInt(militaryTime.substr(0,2)) >= 0 && parseInt(militaryTime.substr(0,2)) <= 23,
            thirdPass = parseInt(militaryTime.substr(2,2)) >= 0 && parseInt(militaryTime.substr(2,2)) <= 59;
        let isValid = firstPass && secondPass && thirdPass;
        return isValid;
    },
    cvtMilitaryTimeToFractional: (militaryTime) => {
        // TODO.
        return militaryTime;
    },
    cvtFractionalToMilitaryTime: (fractionalTime) => {
        // TODO.
        return fractionalTime;
    },
    countOptionalSteps: () => {
        // TODO.
        return 0;
    }
}

/**
 * Poller re-renders only when necessary to save performance
 */
class Poller {
    #lastUpdatedSeen;
    constructor(ms) {
        this.#lastUpdatedSeen = -1;
        setInterval(()=>{
            if(this.#lastUpdatedSeen !== window.settings.lastUpdated) {
                // TODO: Update lastUpdatedSeen to settings.lastUpdated then re-render the page
                // TODO: Re-render includes looking at the Experimental section if it has an user input
            }
        }, ms);
    }
}


$(()=>{
    // Init poller
    let poller = new Poller(100);

    // Event listeners
    // TODO.
    // TODO: .focus-recommendation will toggle display on all other recommendations
})