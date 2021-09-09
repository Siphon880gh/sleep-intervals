
/**
 * Poller re-renders only when necessary to save performance
 */
 class Poller {
    #lastUpdatedSeen;
    constructor(ms) {
        this.#lastUpdatedSeen = -1;
        setInterval(()=>{
            if(this.#lastUpdatedSeen !== window.settings.lastUpdated) {
                this.#lastUpdatedSeen = window.settings.lastUpdated
                this.reRender();   
            }
        }, ms);
    }
    reRender() {
        console.log("Re-rendered");
        const countTotalSteps = utility.countTotalSteps();
        const durationSleepToWake = settings[0].durationSleepToWake;
        const fallAsleepAtFractional = (()=>{
            let timeWakeUpByFractional = utility.cvtMilitaryTimeToFractional(settings[0].timeWakeUpBy);
            let equaled = timeWakeUpByFractional - durationSleepToWake;
            if(equaled<0) equaled = 24+equaled; // standardize any negative to fractional hour around the clock
            return equaled;
        })();

        $(".recommendation").each((i,elRecommend)=>{
            const $elRecommend = $(elRecommend);
            const hasPrepareTime = $elRecommend.find(".optional-prepare-time").length>0;
            let stepSizeFractional;
            // If has prepare time, then the time marks are: prepare time,..., fall asleep time
            // If has no prepare time, then the time marks are ..., fall asleep time

            if(hasPrepareTime) {
                const prepareTime = $elRecommend.find(".optional-prepare-time").val();
                const prepareTimeFractional = utility.cvtMilitaryTimeToFractional(prepareTime);
                stepSizeFractional = (function(fallAsleepAtFractional, prepareTimeFractional){
                    const stepSize = fallAsleepAtFractional-prepareTimeFractional;
                    return Math.round((stepSize + Number.EPSILON) * 100) / 100; // step size in hour fractionals
                })(fallAsleepAtFractional, prepareTimeFractional);
                
                if((prepareTimeFractional>fallAsleepAtFractional) || ( (fallAsleepAtFractional<24 && fallAsleepAtFractional > 18) && (prepareTimeFractional<0 && prepareTimeFractional > 6) ) || (Math.abs(prepareTimeFractional-fallAsleepAtFractional)>6)) {
                    $elRecommend.find(".too-late").removeClass("hide");
                    // console.log("Prepare time too late");
                    return true;
                } else {
                    $elRecommend.find(".too-late").addClass("hide");
                }
            } else {
                stepSizeFractional = $elRecommend.data("stepsize");
                stepSizeFractional = parseFloat(stepSizeFractional);
            }
            $elRecommend.find(".output-optional-step, .h-output-optional-step").hide();
            const countOptionalSteps = utility.countOptionalSteps();

            // Set texts
            $elRecommend.find(".output-first-step textarea").val( settings.prepend.steps.first + settings[0].steps.first );
            $elRecommend.find(".output-last-step textarea").val( settings.prepend.steps.last + settings[0].steps.last );
            for(var i = 0; i < countOptionalSteps; i++) {
                let $optionalStepTextarea = $elRecommend.find(`.output-optional-step-${i} textarea`);
                $optionalStepTextarea.val( settings[0].steps.optional[i] );
                $elRecommend.find(`.output-optional-step-${i}, .h-output-optional-step-${i}`).show();
            }

            // Set timemarks
            const subtractNums = [];
            for(var i = 0; i<countTotalSteps; i++) {
                subtractNums.unshift(stepSizeFractional*i)
            }
            // console.log({subtractNums});

            const timemarks = subtractNums.map(subtractNum=>{
                let timemarkFractional = fallAsleepAtFractional-subtractNum;
                let timemark = utility.cvtFractionalToMilitaryTime(timemarkFractional);
                return timemark;
            });
            // console.log({timemarks});

            $elRecommend.find("td").each((i,td)=>{
                let $td = $(td);
                if(i===0) { // Begin
                    $td.find(".timemark").text(timemarks[i]);
                } else if(i!==countTotalSteps-1) { // Optional
                    $td.find(".timemark").text(timemarks[i]);
                } else if(i===countTotalSteps-1) { // Fall asleep
                    $td.find(".timemark").text(timemarks[i]);
                }
            });


        }); // Re-render all recommendations
    }
}