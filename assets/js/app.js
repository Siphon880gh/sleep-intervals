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
    prepend: {
        steps: {
            first: "Prepare for sleep. ",
            last: "You should've fallen asleep. "
        }
    },
    save: function(mergeObj) {
        this.lastUpdated = Date.now();
        Object.assign(this[0], mergeObj);
    },
    0: {
        timeWakeUpBy: "0600",
        durationSleepToWake: 8,
        steps: {
            first: "",
            optional: [],
            last: "",
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
        return settings[0].steps.optional.length;
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
    $(".help-time-wake-up-by").on('click', ()=>{
        alert("Please use military time. Refer to midnight as 0000 because that starts a new day in AM.");
        window.open("//militaryconnection.com/military-time/");
    });

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


    $(".input-step").on('change', (event) => {
        let $eventEl = $(event.target);
        settings.save({
            steps: {
                first: $(".input-first-step").val(),
                optional: $(".input-optional-step").toArray().map(elTextarea=>elTextarea.value).filter(textarea=>textarea.length),
                last: $(".input-last-step").val()
            }
        });
    });

    $(".focus-recommendation").on("click", (event) => {
        let $eventEl = $(event.target);
        let $eyeBtn = $eventEl;
        let $eyeBtns = $(".focus-recommendation");

        let $recommendation = $eventEl.closest(".recommendation");
        let $recommendations = $(".recommendation");

        let willBecomeActive = !$eyeBtn.hasClass("active");
        $eyeBtns.removeClass("active");

        if(willBecomeActive) {
            $eyeBtn.addClass("active");
            $recommendations.addClass("hide");
            $recommendation.removeClass("hide");
        } else {
            $eyeBtn.removeClass("active");
            $recommendations.removeClass("hide");
        }
    })
})