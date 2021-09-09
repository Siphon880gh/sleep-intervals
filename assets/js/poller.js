
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
        const countSteps = (()=>{
            const countOptionalSteps = utility.countOptionalSteps();
            return 2 + countOptionalSteps; // begin and fall asleep time
        })();
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
            // If has prepare time, then the time marks are: prepare time,..., fall asleep time
            // If has no prepare time, then the time marks are ..., fall asleep time

            if(hasPrepareTime) {
                const prepareTime = $elRecommend.find(".optional-prepare-time").val();
                const prepareTimeFractional = utility.cvtMilitaryTimeToFractional(prepareTime);
                const stepSizeFractional = (function(fallAsleepAtFractional, prepareTimeFractional){
                    const stepSize = fallAsleepAtFractional-prepareTimeFractional;
                    return Math.round((stepSize + Number.EPSILON) * 100) / 100; // step size in hour fractionals
                })(fallAsleepAtFractional, prepareTimeFractional);
                if(fallAsleepAtFractional > prepareTimeFractional) {
                    $elRecommend.find(".too-late").removeClass("hide");
                    console.log("Prepare time too late");
                    return true;
                } else {
                    $elRecommend.find(".too-late").addClass("hide");
                    console.log("Prepare time calculating");
                }
            } else {
                console.log("No prepare time calculating")
            }
        });

        return;
        /*******Below no run */
        $(".recommendation").each((i,elRecommend)=>{
            const $elRecommend = $(elRecommend);
            const stepSizeFractional = ((stepSize)=>{
                stepSize = parseInt(stepSize); // step size in minutes
                return Math.round(((stepSize/60) + Number.EPSILON) * 100) / 100; // step size in hour fractionals
            })($elRecommend.attr("data-stepsize"));
            
            function subtractTime(subtractFrom, stepSizeFractional, by) {
                let equaled = subtractFrom - stepSizeFractional * by;
                if(equaled<0) equaled = 24+equaled; // standardize any negative to fractional hour around the clock
                return equaled;
            }
            
            let splittedFractionals = [];
            let splittedTimemarks = [];
            const isSplittingTimeFromPrepared = $elRecommend.find(".optional-prepare-time").length>0;
            if(isSplittingTimeFromPrepared) {
                let pointATimemark = $elRecommend.find(".optional-prepare-time").val();
                let pointAFractional = utility.cvtMilitaryTimeToFractional(pointATimemark);
                let pointBFractional = subtractFrom;
                // Example 22 vs 2, then convert 2 to 24
                if(pointAFractional > pointBFractional) {
                    if(pointBFractional<10) // reasonable number of hours pass midnight
                        pointBFractional = pointBFractional+=24;
                }
                let delta = pointBFractional - pointAFractional;
                let splitDelta = delta/countSteps;

                console.log("subtractTime from point A and point B", subtractTime(subtractFrom, splitDelta, 0));
                if(splitDelta<=0) console.info(`You're already going to miss sleep because you want to wake up at ${settings[0].timeWakeUpBy} and it takes you ${settings[0].durationSleepToWake} hours to be fully rested in bed including waking up in the middle. Go to bed!`, "Hey!");

                splittedTimemarks = [
                    subtractTime(subtractFrom, splitDelta, 4),
                    subtractTime(subtractFrom, splitDelta, 3),
                    subtractTime(subtractFrom, splitDelta, 2),
                    subtractTime(subtractFrom, splitDelta, 1),
                    subtractTime(subtractFrom, splitDelta, 0)
                ];

                $elRecommend.find("td.output-optional-step, th.h-output-optional-step").removeClass("hide");
                if(countSteps===5) {
                    // Hour fractional -> Military Time -> HHMM element
                    $elRecommend.find("td.output-first-step .timemark").text(utility.cvtFractionalToMilitaryTime(splittedTimemarks[0]));
                    $elRecommend.find("td.output-first-step textarea").text(settings.prepend.steps.first + settings[0].steps.first);

                    $elRecommend.find("td.output-optional-step:nth-child(2) .timemark").text(utility.cvtFractionalToMilitaryTime(splittedTimemarks[1]));
                    $elRecommend.find("td.output-optional-step:nth-child(2) textarea").text(settings[0].steps.optional[0]);

                    $elRecommend.find("td.output-optional-step:nth-child(3) .timemark").text(utility.cvtFractionalToMilitaryTime(splittedTimemarks[2]));
                    $elRecommend.find("td.output-optional-step:nth-child(3) textarea").text(settings[0].steps.optional[1]);

                    $elRecommend.find("td.output-optional-step:nth-child(4) .timemark").text(utility.cvtFractionalToMilitaryTime(splittedTimemarks[3]));
                    $elRecommend.find("td.output-optional-step:nth-child(4) textarea").text(settings[0].steps.optional[2]);

                    $elRecommend.find("td.output-last-step .timemark").text(utility.cvtFractionalToMilitaryTime(splittedTimemarks[4]));
                    $elRecommend.find("td.output-last-step textarea").text(settings.prepend.steps.last + settings[0].steps.last);
                } else if(countSteps===4) {
                    // Hour fractional -> Military Time -> HHMM element
                    $elRecommend.find("td.output-first-step .timemark").text(utility.cvtFractionalToMilitaryTime(splittedTimemarks[0]));
                    $elRecommend.find("td.output-first-step textarea").text(settings.prepend.steps.first + settings[0].steps.first);

                    $elRecommend.find("td.output-optional-step:nth-child(2) .timemark").text(utility.cvtFractionalToMilitaryTime(splittedTimemarks[1]));
                    $elRecommend.find("td.output-optional-step:nth-child(2) textarea").text(settings[0].steps.optional[0]);

                    $elRecommend.find("td.output-optional-step:nth-child(3),.timemark").text(utility.cvtFractionalToMilitaryTime(splittedTimemarks[2]));
                    $elRecommend.find("td.output-optional-step:nth-child(3) textarea").text(settings[0].steps.optional[1]);

                    $elRecommend.find("td.output-optional-step:nth-child(4), th.h-output-optional-step:nth-child(4)").addClass("hide");

                    $elRecommend.find("td.output-last-step .timemark").text(utility.cvtFractionalToMilitaryTime(splittedTimemarks[3]));
                    $elRecommend.find("td.output-last-step textarea").text(settings.prepend.steps.last + settings[0].steps.last);
                } else if(countSteps===3) {
                    // Hour fractional -> Military Time -> HHMM element
                    $elRecommend.find("td.output-first-step .timemark").text(utility.cvtFractionalToMilitaryTime(splittedTimemarks[0]));
                    $elRecommend.find("td.output-first-step textarea").text(settings.prepend.steps.first + settings[0].steps.first);

                    $elRecommend.find("td.output-optional-step:nth-child(2) .timemark").text(utility.cvtFractionalToMilitaryTime(splittedTimemarks[1]));
                    $elRecommend.find("td.output-optional-step:nth-child(2) textarea").text(settings[0].steps.optional[0]);

                    $elRecommend.find("td.output-optional-step:nth-child(3), th.h-output-optional-step:nth-child(3)").addClass("hide");
                    $elRecommend.find("td.output-optional-step:nth-child(4), th.h-output-optional-step:nth-child(4)").addClass("hide");

                    $elRecommend.find("td.output-last-step .timemark").text(utility.cvtFractionalToMilitaryTime(splittedTimemarks[2]));
                    $elRecommend.find("td.output-last-step textarea").text(settings.prepend.steps.last + settings[0].steps.last);
                } else if(countSteps===2) {
                    // Hour fractional -> Military Time -> HHMM element
                    $elRecommend.find("td.output-first-step .timemark").text(utility.cvtFractionalToMilitaryTime(splittedTimemarks[0]));
                    $elRecommend.find("td.output-first-step textarea").text(settings.prepend.steps.first + settings[0].steps.first);

                    $elRecommend.find("td.output-optional-step:nth-child(2), th.h-output-optional-step:nth-child(2)").addClass("hide");
                    $elRecommend.find("td.output-optional-step:nth-child(3), th.h-output-optional-step:nth-child(3)").addClass("hide");
                    $elRecommend.find("td.output-optional-step:nth-child(4), th.h-output-optional-step:nth-child(4)").addClass("hide");

                    $elRecommend.find("td.output-last-step .timemark").text(utility.cvtFractionalToMilitaryTime(splittedTimemarks[1]));
                    $elRecommend.find("td.output-last-step textarea").text(settings.prepend.steps.last + settings[0].steps.last);
                }
                
            } else {

                // console.log("subtractTime using stepSizeFractional", subtractTime(subtractFrom, stepSizeFractional, 4));
                splittedTimemarks = [
                    subtractTime(subtractFrom, stepSizeFractional, 4),
                    subtractTime(subtractFrom, stepSizeFractional, 3),
                    subtractTime(subtractFrom, stepSizeFractional, 2),
                    subtractTime(subtractFrom, stepSizeFractional, 1),
                    subtractTime(subtractFrom, stepSizeFractional, 0)
                ];
                // console.log({splittedTimemarks});

                $elRecommend.find("td.output-optional-step, th.h-output-optional-step").removeClass("hide");
                if(countSteps===5) {
                    // Hour fractional -> Military Time -> HHMM element
                    $elRecommend.find("td.output-first-step .timemark").text(utility.cvtFractionalToMilitaryTime(splittedTimemarks[0]));
                    $elRecommend.find("td.output-first-step textarea").text(settings.prepend.steps.first + settings[0].steps.first);

                    $elRecommend.find("td.output-optional-step:nth-child(2) .timemark").text(utility.cvtFractionalToMilitaryTime(splittedTimemarks[1]));
                    $elRecommend.find("td.output-optional-step:nth-child(2) textarea").text(settings[0].steps.optional[0]);

                    $elRecommend.find("td.output-optional-step:nth-child(3) .timemark").text(utility.cvtFractionalToMilitaryTime(splittedTimemarks[2]));
                    $elRecommend.find("td.output-optional-step:nth-child(3) textarea").text(settings[0].steps.optional[1]);

                    $elRecommend.find("td.output-optional-step:nth-child(4) .timemark").text(utility.cvtFractionalToMilitaryTime(splittedTimemarks[3]));
                    $elRecommend.find("td.output-optional-step:nth-child(4) textarea").text(settings[0].steps.optional[2]);

                    $elRecommend.find("td.output-last-step .timemark").text(utility.cvtFractionalToMilitaryTime(splittedTimemarks[4]));
                    $elRecommend.find("td.output-last-step textarea").text(settings.prepend.steps.last + settings[0].steps.last);
                } else if(countSteps===4) {
                    // Hour fractional -> Military Time -> HHMM element
                    $elRecommend.find("td.output-first-step .timemark").text(utility.cvtFractionalToMilitaryTime(splittedTimemarks[0]));
                    $elRecommend.find("td.output-first-step textarea").text(settings.prepend.steps.first + settings[0].steps.first);

                    $elRecommend.find("td.output-optional-step:nth-child(2) .timemark").text(utility.cvtFractionalToMilitaryTime(splittedTimemarks[1]));
                    $elRecommend.find("td.output-optional-step:nth-child(2) textarea").text(settings[0].steps.optional[0]);

                    $elRecommend.find("td.output-optional-step:nth-child(3),.timemark").text(utility.cvtFractionalToMilitaryTime(splittedTimemarks[2]));
                    $elRecommend.find("td.output-optional-step:nth-child(3) textarea").text(settings[0].steps.optional[1]);

                    $elRecommend.find("td.output-optional-step:nth-child(4), th.h-output-optional-step:nth-child(4)").addClass("hide");

                    $elRecommend.find("td.output-last-step .timemark").text(utility.cvtFractionalToMilitaryTime(splittedTimemarks[3]));
                    $elRecommend.find("td.output-last-step textarea").text(settings.prepend.steps.last + settings[0].steps.last);
                } else if(countSteps===3) {
                    // Hour fractional -> Military Time -> HHMM element
                    $elRecommend.find("td.output-first-step .timemark").text(utility.cvtFractionalToMilitaryTime(splittedTimemarks[0]));
                    $elRecommend.find("td.output-first-step textarea").text(settings.prepend.steps.first + settings[0].steps.first);

                    $elRecommend.find("td.output-optional-step:nth-child(2) .timemark").text(utility.cvtFractionalToMilitaryTime(splittedTimemarks[1]));
                    $elRecommend.find("td.output-optional-step:nth-child(2) textarea").text(settings[0].steps.optional[0]);

                    $elRecommend.find("td.output-optional-step:nth-child(3), th.h-output-optional-step:nth-child(3)").addClass("hide");
                    $elRecommend.find("td.output-optional-step:nth-child(4), th.h-output-optional-step:nth-child(4)").addClass("hide");

                    $elRecommend.find("td.output-last-step .timemark").text(utility.cvtFractionalToMilitaryTime(splittedTimemarks[2]));
                    $elRecommend.find("td.output-last-step textarea").text(settings.prepend.steps.last + settings[0].steps.last);
                } else if(countSteps===2) {
                    // Hour fractional -> Military Time -> HHMM element
                    $elRecommend.find("td.output-first-step .timemark").text(utility.cvtFractionalToMilitaryTime(splittedTimemarks[0]));
                    $elRecommend.find("td.output-first-step textarea").text(settings.prepend.steps.first + settings[0].steps.first);

                    $elRecommend.find("td.output-optional-step:nth-child(2), th.h-output-optional-step:nth-child(2)").addClass("hide");
                    $elRecommend.find("td.output-optional-step:nth-child(3), th.h-output-optional-step:nth-child(3)").addClass("hide");
                    $elRecommend.find("td.output-optional-step:nth-child(4), th.h-output-optional-step:nth-child(4)").addClass("hide");

                    $elRecommend.find("td.output-last-step .timemark").text(utility.cvtFractionalToMilitaryTime(splittedTimemarks[1]));
                    $elRecommend.find("td.output-last-step textarea").text(settings.prepend.steps.last + settings[0].steps.last);
                }
            }

            // console.log({i, stepSizeFractional});
        })
    }
}