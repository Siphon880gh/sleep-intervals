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
    save: function(mergeObj) {
        this.lastUpdated = Date.now();
        Object.assign(this[0], mergeObj);
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
        let h = parseInt(militaryTime.substr(0,2));
        let m = parseInt(militaryTime.substr(2,2));
        let fractional = hh+(mm/60)
        // Round to two decimal places
        fractional = Math.round((fractional + Number.EPSILON) * 100) / 100;
        return fractional;
    },
    cvtFractionalToMilitaryTime: (fractionalTime) => {
        let h = Math.floor(fractional);
        let hh = h<10?"0"+h:""+h;

        let moduled = fractional%1;
        let m = Math.round(moduled*60);
        let mm = m<10?"0"+m:""+m;

        let timemark = hh+mm;
        return timemark;
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

// Init poller
$(()=>{
    let poller = new Poller(100);
})

// Event handlers
$(()=>{
    $(".input-time-wake-up-by").on('change', (event) => {
        let $eventEl = $(event.target);
        let timeWakeUpBy = $eventEl.val()+"";
        // console.log({inputtedMilitaryTime});

        let isValidated = utility.validateMilitaryTime(timeWakeUpBy);
        // console.log({isValidated})

        if(isValidated) {
            $eventEl.removeClass("is-invalid").addClass("is-valid");
            settings.save({timeWakeUpBy})
        } else
            $eventEl.addClass("is-invalid").removeClass("is-valid");
    });

    $(".input-duration-sleep-to-wake").on('change', (event) => {
        let $eventEl = $(event.target);
        let durationSleepToWake = $eventEl.val();
        durationSleepToWake = parseInt(durationSleepToWake);
        console.log({durationSleepToWake});


        $eventEl.addClass("is-valid");
        settings.save({durationSleepToWake});
    });

    // TODO: .focus-recommendation will toggle display on all other recommendations
})