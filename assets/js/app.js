/**
 * Test Mode
 * If mocking a time instead of using current time for calculations, enter a string like "1800"
 * That is military time. Otherwise, set to false or null.
 * 
 * mockNowMilitaryTime false | null | String
 * 
 */
window.mockNowMilitaryTime = false;
// window.mockNowMilitaryTime = "1800";

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
            first: "",
            last: ""
        }
    },
    0: {
        timeWakeUpBy: "0600",
        durationSleepToWake: 8,
        steps: {
            first: "Prepare for sleep. Wrap up or migrate tasks to the future (write somewhere). No execution or planning. Wrap up conversations or set boundaries. DND on phone (consider scheduled DND).",
            optional: [
                "Sleep pills if you take them. Review the timemarks/steps to falling asleep.",
                "Hot shower to help sleep. Be near or on bed. Relaxation activities (videogame allowed with blue light blocking glasses). Lights are dimmed or dark.",
                "Postpone all relaxation activities. Close eyes. May listen to non-stimulating podcasts with eyes closed."],
            last: "You should've fallen asleep. If not, did you follow instructions? Is this too early for sleep? Or should you practice sleep restriction (google it)?",
        },
        focus: null
    }
}

/**
 * Persist settings
 */
persistSettings = () => {
    let settings = window.settings[0]
    localStorage.setItem("sleepIntervals__settings", JSON.stringify(settings))
}

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
            Object.assign(window.settings[0], {timeWakeUpBy});
            persistSettings();
        } else
            $eventEl.addClass("is-invalid").removeClass("is-valid");
    });

    $(".input-duration-sleep-to-wake").on('change', (event) => {
        let $eventEl = $(event.target);
        let durationSleepToWake = $eventEl.val();
        // debugger;

        $eventEl.addClass("is-valid");
        Object.assign(window.settings[0], {durationSleepToWake});
        persistSettings();
    });

    $(".optional-prepare-time").on('change', (event) => {
        let $eventEl = $(event.target);
        let inputPointA = $eventEl.val()+"";

        let isValidated = utility.validateMilitaryTime(inputPointA);

        if(isValidated) {
            $eventEl.removeClass("is-invalid").addClass("is-valid");
        } else
            $eventEl.addClass("is-invalid").removeClass("is-valid");
    });
    
    $(".optional-prepare-time").on('change', (event) => {
        let $eventEl = $(event.target);
        let possMilitaryTime = $eventEl.val();
        // if(utility.validateMilitaryTime(possMilitaryTime))
        //     settings.save({});
        // Nothing to save in settings though
    });

    $(".input-first-step").on("change", (ev)=>{
        let {target:el} = ev;
        let {value} = el;
        window.settings[0].steps.first = value;
        persistSettings();
    });
    $(".input-last-step").on("change", (ev)=>{
        let {target:el} = ev;
        let {value} = el;
        window.settings[0].steps.last = value;
        persistSettings();
    });
    $(".input-optional-step").on("change", (ev)=>{
        let optionals = $(".input-optional-step").toArray().map(optional => {
            let $optional = $(optional);
            let text = $optional.val();
            return text;
        })
        window.settings[0].steps.optional = optionals;
        persistSettings();
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
            window.settings[0].focus = $eyeBtn.closest(".recommendation").index();
            persistSettings();
        } else {
            $eyeBtn.removeClass("active");
            $recommendations.removeClass("hide");
            window.settings[0].focus = null;
            persistSettings();
        }
    });

    $(".timemark").on("click", (event)=>{
        let $eventEl = $(event.target);
        $eventEl.next("input[type='checkbox']").click();
    });
})

/**
 * Get persisted and macro user interactions
 */

$(()=>{
    let settings = JSON.parse(localStorage.getItem("sleepIntervals__settings"))
    if(settings) {
        Object.assign(window.settings[0], settings);
    }

    $(".input-duration-sleep-to-wake")[0].selectedIndex = $(`.input-duration-sleep-to-wake option[value="${window.settings[0].durationSleepToWake}"]`).index();
    $(".input-time-wake-up-by")[0].value = window.settings[0].timeWakeUpBy;

    // Fill some steps
    $(".input-first-step").val(window.settings[0].steps.first);
    for(var i = 0; i < window.settings[0].steps.optional.length; i++) {
        if(i===0) {
            $("td:nth-child(2) .input-optional-step").val(window.settings[0].steps.optional[i]);
        } else if (i===1) {
            $("td:nth-child(3) .input-optional-step").val(window.settings[0].steps.optional[i]);
        } else if (i===2) {
            $("td:nth-child(4) .input-optional-step").val(window.settings[0].steps.optional[i]);
        }
    }
    $(".input-last-step").val(window.settings[0].steps.last);

    let focused = window.settings[0].focus;
    if(focused!==null) {
        let i = focused;
        $(".recommendation").eq(i).find(".focus-recommendation").click();
    }

    // Init calculator poller
    window.poller = new Poller(100);
})



/**
 * Utility functions
 */
window.utility = {
    getTimeNowMockAlerted: false,
    getTimeNow: () => {
        if(window.mockNowMilitaryTime===false || window.mockNowMilitaryTime===null)
            return Date.now();

        if(window.utility.validateMilitaryTime(window.mockNowMilitaryTime)) {
            // Convert mocked military time to Date() compatible
            // E.g. "24-Nov-2009 18:00:00"
            var cvtMtStdDate = () => {
                let currentDate = Date.now();
                let dd = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(currentDate);
                let mmm = new Intl.DateTimeFormat('en', { month: 'short' }).format(currentDate);
                let yyyy = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(currentDate);
                return dd + "-" + mmm + "-" + yyyy;
            }
            var cvtMtStdTime = () => {
                let hh = window.mockNowMilitaryTime.substr(0,2);
                let mm = window.mockNowMilitaryTime.substr(2,2);
                let ss = "00";
                return hh + ":" + mm + ":" + ss;
            };
            let stdTimeAll = cvtMtStdDate() + " " + cvtMtStdTime();
            let cvtMockUnix = Date.parse(stdTimeAll);

            return cvtMockUnix;
        } else {
            if(!window.utility.getTimeNowMockAlerted) {
                alert("Error: Test's window.mockNowMilitaryTime incorrect format. This is used to override the current time used for calculations. Try eg. 2100. Or set to false or null to turn off test mode and use the actual current time. Because the test failed, we are turning off test mode for this session and using the current time instead.");
                window.utility.getTimeNowMockAlerted = true;
            }
            return Date.now();
        }
    },
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
        let fractional = h+(m/60)
        // Round to two decimal places
        fractional = Math.round((fractional + Number.EPSILON) * 100) / 100;
        return fractional;
    },
    cvtFractionalToMilitaryTime: (fractionalTime) => {
        let h = Math.floor(fractionalTime);
        let hh = (""+h).padStart(2,"0");

        let moduled = fractionalTime%1;
        let m = Math.round(moduled*60);
        let mm = (""+m).padStart(2,"0");

        let timemark = hh+mm;
        return timemark;
    },
    countOptionalSteps: () => {
        return settings[0].steps.optional.length;
    },
    countTotalSteps: () => {
        return utility.countOptionalSteps() + 2; // begin and fall asleep steps
    }
}

// Init current time
$(()=>{
    let h = new Date(window.utility.getTimeNow()).getHours();
    let m = new Date(window.utility.getTimeNow()).getMinutes();
    let hh = (""+h).padStart(2, "0"), 
        mm = (""+m).padStart(2, "0");
    let timemark = ""+hh+mm;
    let fractional = utility.cvtMilitaryTimeToFractional(timemark);
    let minutes = (fractional % 1) * 60;
    
    let mRoundedUp = (()=>{
        if(minutes<=60 && minutes > 45) {
            return 0;
        } else if(minutes<=45 && minutes > 30) {
            return 45;
        } else if(minutes<=30 && minutes > 15) {
            return 30;
        } else if(minutes<=15 && minutes >= 0) {
            return 15;
        }
    })(minutes);

    let mmRoundedUp = (""+mRoundedUp).padStart(2, "0");

    // Round up to next hour?
    let hAffected=h, hhAffected=hh; 
    if(mRoundedUp===0) {
        hAffected+=1;
        hhAffected = (""+hAffected).padStart(2, "0");
    }

    $(".time-opened-app").val(""+hh+mm);
    $(".optional-prepare-time").val(""+hhAffected+mmRoundedUp);
});