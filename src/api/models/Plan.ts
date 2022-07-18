import { ITask } from "./Task"

export interface IPlan {
    id : number,
    name : string,
    date : string,
    tasks : ITask[]
}

class Plan implements IPlan {
    name : string
    date : string
    tasks : ITask[]
    id: number

    constructor({name,tasks,date,id} : IPlan){
        this.name = name
        this.tasks = tasks
        this.date = date
        this.id = id
    }

}

export default Plan