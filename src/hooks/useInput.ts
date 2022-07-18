import { useState } from "react";

export default function useInput ( defaultValue? : string | number) : any[] {
    const [value, setValue] = useState(defaultValue)

    return [{
        value : value,
        onChange : (e: any) => setValue(e.target.value)
    },setValue]
}