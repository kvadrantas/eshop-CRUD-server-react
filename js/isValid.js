// Check if data is valid weather it is text or number 
// and also controls if required data exists.
// Optional data can be empty, but if it is not
// it is also validated


function isValid(type, req, val) {
    if(req === 'required' && val !== 0) {
        if(!val) {console.log('required empty', val); return false;}
    }
    
    // console.log(val)
    switch (type) {
        case 'txt':
            if(
                val.length > 255
            ) 
            {console.log('greater then 255', val); return false;}
            else return true;
            break;
        case 'num':
            if(val) {
                if(
                    parseFloat(val) < 0 || !isFinite(parseFloat(val))
                )
                {console.log('negative', val); return false;}
                else return true;
            } return true;
            break;
        case 'boolean':
            if(typeof val === 'boolean' || val === 1 || val === 0) 
            return true;
            else {console.log('not bool', val); return false;}
            break;
        default:
            break;
    }
}

export default isValid;
