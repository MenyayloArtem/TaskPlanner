export default function(time : number): string {
    let minutes = String(Math.floor(time / 60))
    time = time % 60
    let seconds = String(time)

    function n(x : string) {
        if(x.length == 1) {
            x = '0' + x
        }
        return x
    }
    return `${n(minutes)}:${n(seconds)}`
}