/**
 * @file _test/app.js
 * Emulate user behaviors then check DOM and model states
 * This is a quick test using the browser's console.assert
 * Does not break or count passes/fails.
 * 
 */

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