import LocalStorage from "./clients/LocalStorage"
import { ITask } from "./models/Task"
type clients = LocalStorage
export interface IApi {
    client : {
        getAll : Function,
        get : Function,
        add : Function,
        remove : Function,
        update : Function,
        updateTask : (plan_id: number, task_id: number, data: ITask) => Promise<ITask | null>
    }
}

class API implements IApi{

    client: { getAll: Function; get: Function; add: Function; remove: Function; update: Function; updateTask: (plan_id: number, task_id: number, data: ITask) => Promise<ITask | null> }
    constructor(client : clients) {
        this.client = client
    }
}

let api = new API(new LocalStorage())

export default api