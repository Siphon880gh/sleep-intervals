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
            first: "1",
            optional: ["a","b","c"],
            last: "2",
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
        let fractional = h+(m/60)
        // Round to two decimal places
        fractional = Math.round((fractional + Number.EPSILON) * 100) / 100;
        return fractional;
    },
    cvtFractionalToMilitaryTime: (fractionalTime) => {
        let h = Math.floor(fractionalTime);
        let hh = h<10?"0"+h:""+h;

        let moduled = fractionalTime%1;
        let m = Math.round(moduled*60);
        let mm = m<10?"0"+m:""+m;

        let timemark = hh+mm;
        return timemark;
    },
    countOptionalSteps: () => {
        return settings[0].steps.optional.length;
    }
}

// Inits
$(()=>{
    // Init poller
    window.poller = new Poller(100);

    // Fill form to match model
        // Fill times
        document.querySelector(".input-duration-sleep-to-wake").selectedIndex = $(`.input-duration-sleep-to-wake option[value="${settings[0].durationSleepToWake}"]`).index();
        document.querySelector(".input-time-wake-up-by").value = settings[0].timeWakeUpBy;
        $(".input-duration-sleep-to-wake, .input-time-wake-up-by").trigger("change");
    
        // Fill some steps
        $(".input-first-step").val(settings[0].steps.first);
        for(var i = 0; i < settings[0].steps.optional.length; i++) {
            if(i===0) {
                $("td:nth-child(2) .input-optional-step").val(settings[0].steps.optional[i]);
            } else if (i===1) {
                $("td:nth-child(3) .input-optional-step").val(settings[0].steps.optional[i]);
            } else if (i===2) {
                $("td:nth-child(4) .input-optional-step").val(settings[0].steps.optional[i]);
            }
        }
        $(".input-last-step").val(settings[0].steps.last);
        $(".input-last-step").trigger("change");
    
});

// Init current time
$(()=>{
    let h = new Date(Date.now()).getHours();
    let m = new Date(Date.now()).getMinutes();
    let hh = (""+h).padStart(2, "0"), 
        mm = (""+m).padStart(2, "0");
    let timemark = ""+hh+mm;
    let fractional = utility.cvtMilitaryTimeToFractional(timemark);
    let minutes = (fractional % 1) * 60;
    let mRounded = (()=>{
        if(minutes<=60 && minutes > 45) {
            return 0;
        } else if(minutes<=45 && minutes > 30) {
            return 45;
        } else if(minutes<=30 && minutes > 15) {
            return 30;
        } else if(minutes<=15 && minutes > 0) {
            return 15;
        }
    })(minutes);

    let mmRounded = (""+mRounded).padStart(2, "0");

    $(".time-opened-app").val(""+hh+mm);
    $(".optional-prepare-time").val(""+hh+mmRounded);
});

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

    $(".override-splitting-time-from").on('change', (event) => {
        let $eventEl = $(event.target);
        let inputPointA = $eventEl.val()+"";

        let isValidated = utility.validateMilitaryTime(inputPointA);
        // console.log({isValidated})

        if(isValidated) {
            $eventEl.removeClass("is-invalid").addClass("is-valid");
        } else
            $eventEl.addClass("is-invalid").removeClass("is-valid");
    });

    $(".input-duration-sleep-to-wake").on('change', (event) => {
        let $eventEl = $(event.target);
        let durationSleepToWake = $eventEl.val();
        durationSleepToWake = parseInt(durationSleepToWake);
        // console.log({durationSleepToWake});

        $eventEl.addClass("is-valid");
        // settings.save({durationSleepToWake});
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
    });

    $(".timemark").on("click", (event)=>{
        let $eventEl = $(event.target);
        $eventEl.next("input[type='checkbox']").click();
    });
})