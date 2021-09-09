/**
 * @file _test/app.js
 * Emulate user behaviors then check DOM and model states
 * This is a quick test using the browser's console.assert
 * Does not break or count passes/fails.
 * 
 */

function test__resetBehaviors() {
    $(".input-time-wake-up-by").val("");
    $(".input-step").val("");
}

// Test validate military time
$(()=>{
    const test=(militaryTime)=>{

        switch(militaryTime) {
            // First pass
            case "1111":
                console.assert(typeof "1111" === "string");
                console.assert("1111".length===4);
                break;

            case "2400": // mock wrong
                console.assert("2400".substr(0,2)==="24");
                console.assert(parseInt("2400".substr(0,2))>=0);
                console.assert(parseInt("2400".substr(0,2))<=23===false);
                break;

            case "1260": // mock wrong
                console.assert("1260".substr(2,2)==="60");
                console.assert(parseInt("1260".substr(2,2))>=0);
                console.assert(parseInt("1260".substr(2,2))<=59===false);
                break;
                
                
            default:
                console.assert(false);
        }
    }

    test("1111");
    test("1260");
    test("2400");
    
});

// Test converting military time to fractional
$(()=>{
    const test = (militaryTime) => {
        const feelingLucky = (militaryTime) => {
            let hh = parseInt(militaryTime.substr(0,2));
            let mm = parseInt(militaryTime.substr(2,2));
            let fractional = hh+(mm/60)
            // Round to two decimal places
            return Math.round((fractional + Number.EPSILON) * 100) / 100;
        }
        switch(militaryTime) {
                
            case "1100":
                console.assert(feelingLucky("1100")===11);
                break;
            case "1115":
                console.assert(feelingLucky("1115")===11.25);
                break;
            default:
                console.assert(false);
        }
    }

    test("1100");
    test("1115");

});


// Test converting fractional time to militaryTime
$(()=>{
    const test = (fractional) => {
        switch(fractional) {
                
            case 11:
                console.assert(fractional+""==="11");
                var moduled  = fractional%1;
                console.assert(moduled===0);
                var m = Math.round(moduled*60);
                console.assert((m<10?"0"+m:""+m)==="00");
                console.assert(("11"+"00")==="1100");
                break;
            case 11.25:
                var moduled = fractional%1;
                console.assert(moduled===0.25);
                let h = Math.floor(fractional);
                console.assert(h===11);
                console.assert((h<10?"0"+h:""+h)==="11");
                var m = Math.round(moduled*60);
                console.assert((m<10?"0"+m:""+m)==="15");
                break;
            default:
                console.assert(false);
        }
    }

    test(11);
    test(11.25);
})

// Test varied filled optional steps
$(()=>{

    const testInputSelectors = (stepBehaviors) => {
        test__resetBehaviors();

        $(".input-first-step").val(stepBehaviors[0]);
        $("td:nth-child(2) .input-optional-step").val(stepBehaviors[1]);
        $("td:nth-child(3) .input-optional-step").val(stepBehaviors[2]);
        $("td:nth-child(4) .input-optional-step").val(stepBehaviors[3]);
        $(".input-last-step").val(stepBehaviors[4]);

        $(".input-step").each((i, elTextarea) => {
            console.assert(elTextarea.value === stepBehaviors[i]);
        });
    }

    const testOutputSelectors = () => {
        $recommendation = $(".recommendation[data-stepsize='30m']");
        let m0 = $recommendation.find("td.output-first-step");
        let a = $recommendation.find("td.output-optional-step:nth-child(2)");
        let b = $recommendation.find("td.output-optional-step:nth-child(3)");
        let c = $recommendation.find("td.output-optional-step:nth-child(4)");
        let m1 = $recommendation.find("td.output-last-step");
        console.assert(m0.length+a.length+b.length+c.length+m1.length===5);
    }

    const testOptionalStepsModel = (stepBehaviors) => {
        test__resetBehaviors();

        $(".input-first-step").val(stepBehaviors[0]);
        $("td:nth-child(2) .input-optional-step").val(stepBehaviors[1]);
        $("td:nth-child(3) .input-optional-step").val(stepBehaviors[2]);
        $("td:nth-child(4) .input-optional-step").val(stepBehaviors[3]);
        $(".input-last-step").val(stepBehaviors[4]);
        $(".input-last-step").trigger("change");

        if(stepBehaviors.join(",")==="0,a,b,c,1") {
            console.assert(utility.countOptionalSteps()===3);

        } else if(stepBehaviors.join(",")==="0,a,,c,1") {
            console.assert(utility.countOptionalSteps()===2);

        } else if(stepBehaviors.join(",")==="0,a,b,,1") {
            console.assert(utility.countOptionalSteps()===2);
            
        } else if(stepBehaviors.join(",")==="0,,b,,1") {
            console.assert(utility.countOptionalSteps()===1);
            
        }

    }

    testInputSelectors(["0", "a", "b", "c", "1"]);
    testOutputSelectors();
    testOptionalStepsModel(["0", "a", "b", "c", "1"]);
    testOptionalStepsModel(["0", "a", "", "c", "1"]);
    testOptionalStepsModel(["0", "a", "b", "", "1"]);
    testOptionalStepsModel(["0", "", "b", "", "1"]);
    test__resetBehaviors();
})

// Test timemark recommendations
$(()=>{
    // - If user entered 0600 wake up time, 8 hours to be in bed, and filled 1 optional step,
    // then we expect appropriate timemarks and only 1 visible optional stes per recommendation.
    // - The appropriate timemarks are the steps back from the time you should fall asleep, which is the time to wake up + time it takes for a full rest in bed.
    // - So for ideal 30 min time markets, the appropriate timemarks are 30 mins at a time back for however number of steps there are. These are the recommended
    // steps and timemarks in preparing for sleep.
    // - However, at "opened app" and "experimental" there's a provided time to prepare to sleep, so calculating the timemarks for the steps is different. 
    // You divide time evenly for number of steps between provided time and the time you should fall asleep.
    const expects = {
        subtractFrom:6,
        stepSizeFractional: [
            0,
            .5,
            .75,
            1
        ]
    }

    // Fill times
    document.querySelector(".input-duration-sleep-to-wake").selectedIndex=8
    document.querySelector(".input-time-wake-up-by").value = "0600";
    $(".input-duration-sleep-to-wake, .input-time-wake-up-by").trigger("change");

    // Fill some steps
    $(".input-first-step").val("0");
    // $("td:nth-child(2) .input-optional-step").val("a");
    $("td:nth-child(3) .input-optional-step").val("b");
    // $("td:nth-child(4) .input-optional-step").val("c");
    $(".input-last-step").val("1");

    $(".time-opened-app, .override-splitting-time-from").val("2200");

    const countSteps = (()=>{
        const countOptionalSteps = utility.countOptionalSteps();
        return 2 + countOptionalSteps;
    })();
    const durationSleepToWake = settings[0].durationSleepToWake;
    const subtractFrom = (()=>{
        timeWakeUpByFractional = utility.cvtMilitaryTimeToFractional(settings[0].timeWakeUpBy);
        let equaled = timeWakeUpByFractional - durationSleepToWake;
        if(equaled<0) equaled = 24+equaled; // standardize any negative to fractional hour around the clock
        return equaled;
    })();

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
        const isSplittingTimeFromPrepared = $elRecommend.find(".override-splitting-time-from").length>0;
        if(isSplittingTimeFromPrepared) {
            let pointATimemark = $elRecommend.find(".override-splitting-time-from").val();
            let pointAFractional = utility.cvtMilitaryTimeToFractional(pointATimemark);
            let pointBFractional = subtractFrom;
            // Example 22 vs 2, then convert 2 to 24
            if(pointAFractional > pointBFractional) {
                if(pointBFractional<10) // reasonable number of hours pass midnight
                    pointBFractional = pointBFractional+=24;
            }
            let delta = pointBFractional - pointAFractional;
            let divs = delta/countSteps;
            if(divs<=0) alert(`You're already going to miss sleep because you want to wake up at ${settings[0].timeWakeUpBy} and takes ${settings[0].durationSleepToWake} hours to be fully rested in bed including waking up in the middle. Go to bed!`, "Hey!");

            // let pointA = utility.cvtMilitaryTimeToFractional(timemark);
            // let equaled = subtractFrom - pointA;
            // if(equaled<0) equaled = 24+equaled; // standardize any negative to fractional hour around the clock

            let overridingStepSize 

            // TODO
            
        } else {
            splittedTimemarks = [
                subtractTime(subtractFrom, stepSizeFractional, 0),
                subtractTime(subtractFrom, stepSizeFractional, 1),
                subtractTime(subtractFrom, stepSizeFractional, 2),
                subtractTime(subtractFrom, stepSizeFractional, 3)
            ];
            // console.log({splittedTimemarks});
            console.assert(stepSizeFractional===.5 || stepSizeFractional===.75 || stepSizeFractional===1)
            switch(stepSizeFractional) {
                case .5:
                    console.assert(splittedTimemarks[0]===22);
                    console.assert(splittedTimemarks[1]===21.5);
                    console.assert(splittedTimemarks[2]===21);
                    console.assert(splittedTimemarks[3]===20.5);
                    break;
                case .75:
                    console.assert(splittedTimemarks[0]===22);
                    console.assert(splittedTimemarks[1]===21.25);
                    console.assert(splittedTimemarks[2]===20.5);
                    console.assert(splittedTimemarks[3]===19.75);
                    break;
                case 1:
                    console.assert(splittedTimemarks[0]===22);
                    console.assert(splittedTimemarks[1]===21);
                    console.assert(splittedTimemarks[2]===20);
                    console.assert(splittedTimemarks[3]===19);
                    break;
            }
            $elRecommend.find("td.output-optional-step").removeClass("hide");
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
        console.assert(stepSizeFractional===expects.stepSizeFractional[i]);
    })
})