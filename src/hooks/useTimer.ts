import { useRef, useState } from "react"

export default function() : any[] {
    let active = useRef(true)

    function toggle(){
        active.current = !active.current
    }

    function startTimer (callback : Function,delay: number) {
        return new Promise((resolve)=>{
            let interval = setInterval(()=>{
                if(active.current) {
                    delay -= 1
                    callback(delay)

                    if(delay <= 0) {
                        clearInterval(interval)
                        resolve(true)
                    }
                }
            },1000)
        })
    }
    
    return [startTimer, toggle, active.current]
}