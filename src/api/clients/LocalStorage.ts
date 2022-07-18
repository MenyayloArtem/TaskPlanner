import { IApi } from "../api"
import { IPlan } from "../models/Plan"
import { ITask } from "../models/Task"


class LocalStorage  {
    async getAll() {
        let res = localStorage.getItem('plans')
        let data: IPlan[]
        if(res) {
            data = JSON.parse(res)
        } else {
            data = []
        }
        return data
    }

    async get(plan_id : number) {
        let data = await this.getAll()
        let plan = data.find(item => item.id == plan_id)
        return plan
    }

    async add(plan: IPlan) {
        let data = await this.getAll()
        data.push(plan)
        localStorage.setItem('plans',JSON.stringify(data))
        return plan
    }

    private sync(plans : IPlan[]){
        localStorage.setItem("plans",JSON.stringify(plans))
    }

    async update(plan_id: number, data : IPlan) {
        let plans = await this.getAll()
        let index = plans.findIndex(item => item.id == plan_id)

        plans[index] = data
        this.sync(plans)
        return plans[index]
    }

    async remove(plan_id: number) {
        let plans = await this.getAll()
        let plan: IPlan | undefined = plans.find((item: IPlan) => item.id == plan_id)

        if(plan) {
            plans = plans.filter((item: IPlan) => item.id != plan!.id)
        }

        this.sync(plans)
        return plans
    }

    async updateTask(plan_id: number,task_id: number, data: ITask) {
        let plan = await this.get(plan_id)
        if(plan) {
            let taskIndex = plan.tasks.findIndex(item => item.id == task_id)
            plan.tasks[taskIndex] = data
            await this.update(plan_id,plan)
            let task = plan?.tasks[taskIndex]
            if(task) {
                return task
            }
            return null
        }
        
        return null
    }
}

export default LocalStorage