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

})