import { useState } from "react";

export default function(min: number, max: number, defaultValue? : number) {
    let [value, setValue] = useState(defaultValue || min)

    if(value < min) {
        setValue(min)
    } else if (value > max) {
        setValue(max)
    }
    
    if (!value && value != 0) {
        setValue(min)
    }
    
    return {
        value,
        onChange : (e: number) => setValue(e)
    }
}