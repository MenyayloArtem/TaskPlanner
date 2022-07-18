import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import toFormat from '../helpers/toFormat'
import { RootState } from '../redux/store'
import {ITask} from "../api/models/Task"
import addClass from "../helpers/addClass"


interface Props extends ITask {
    onClick : Function,
    isCurrent? : boolean,
}

function Task(props : Props) {
    let {name, break_time, work_time, isCurrent = false, onClick, completed} = props
    let app = useSelector((state : RootState) => state.app)
    let time_template = `${toFormat(work_time)} +${toFormat(break_time)}`

    return (
        <div className={`task`
        + addClass(isCurrent,"current")
        + addClass(app.mode == "Break","break")
        + addClass(completed,"completed")
        }
        onClick={() => onClick()}
        >
            <div className="task__name">
                {name}
            </div>
            <div className="task__duration">
                <div className="task__time">
                    { time_template }
                </div>
            </div>
        </div>
    )
}

export default Task
