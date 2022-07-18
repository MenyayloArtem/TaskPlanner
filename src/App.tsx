import React, { useCallback, useEffect, useRef, useState } from 'react';
import './App.scss';
import { Button, Input, InputNumber } from 'antd';
import {Calendar} from 'antd';
import {List} from 'antd';
import useInput from './hooks/useInput';
import Task from './components/Task';
import useRange from './hooks/useRange'
import { ITask } from './api/models/Task';
import toFormat from './helpers/toFormat';
import useTimer from './hooks/useTimer';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, setMode } from './redux/store';
import api from './api/api';
import type { Moment } from 'moment';
import { IPlan } from './api/models/Plan';
import todaysdate from './helpers/todaysdate';

function App () {
  let tasks: ITask[]
  let setTasks: any;
  [tasks, setTasks] = useState([])
  let [input,setValue] = useInput('')

  let app = useSelector((state : RootState) => state.app)
  let dispatch = useDispatch()
  let plans: IPlan[]
  let setPlans: any;
  [plans, setPlans] = useState([])
  let [plan, setPlan] = useState<IPlan | null>(null)
  let work_mins = useRange(0,59,10)
  let work_secs = useRange(0,59)
  let break_mins = useRange(0,59,2)
  let break_secs = useRange(0,59)
  let [total, setTotal] = useState(0)
  let [currentTask, setCurrentTask] = useState<null | number>(null)
  let [startTaskTimer, toggleTaskTimer] = useTimer()
  let [time, setTime] = useState(0)
  let [planName, setPlanName] = useInput()
  let [date, setDate] = useState(todaysdate())
  

  let [id,setId] = useState(Math.random())

  useEffect(()=>{
    api.client.getAll()
    .then((res : IPlan[]) => {
      res = res.sort((a,b) => {
        return +(a.date.split('-').join('')) - +(b.date.split('-').join(''))
      })
      setPlans(res)
      if(res.length) {
        setPlan(res[0])
      }
    })
  },[])

  useEffect(()=>{
    setPlanName(plan?.name || '')
    setTasks(plan?.tasks || [])
  },[plan])

  const deleteTask = useCallback((id: number) => {
    if(app.mode == 'Prepare') {
      let newData = tasks.filter(item => item.id != id)
      setTasks(newData)
    } else {
      alert("Cannot delete task while work")
    }
  },[tasks,app.mode])

  const deletePlan = useCallback(async (id: number)=>{
    let c = confirm("Delete plan?")

    if(c) {
      let newData = await api.client.remove(id)

      setPlans(newData)
      setPlan(newData[0])
    }
  },[plans])

  function addItem(item: string): void {
    if(item) {
      if((work_mins.value || work_secs.value) && (break_mins.value || break_secs.value)) {
    
        let task : ITask = {
          name : item,
          work_time : work_mins.value * 60+ work_secs.value,
          break_time : break_mins.value * 60
        + break_secs.value,
          id : id,
          completed : false
        }

        setTasks([...tasks,task])
        setValue('')
        setId(Math.random())
      }
    } else {
      alert("Entry all fields")
    }
    
  }

  const onSelect = (value: Moment) => {
    setDate(value.format('YYYY-MM-DD'))
  };

  async function startTimer(delay: number) {
    setTime(delay)
    let res = startTaskTimer((time: number)=>{
      setTime(time)
    },delay)
    return res
  }

  const run = async function() {

    for(let i = 0; i < tasks.length; i++) {
      let item = tasks[i]
      if(item) {
        if(!item.completed) {
          dispatch(setMode("Work"))
          setCurrentTask(item.id)
          await startTimer(item.work_time)
          
          dispatch(setMode('Break'))
          await startTimer(item.break_time)

          let res = await api.client.updateTask(plan!.id,item.id,{
            ...item,
            completed : true
          })
          let index = tasks.findIndex(task => task.id == item.id)
          let newTasks = tasks
          if(index >= 0) {
            newTasks[index] = res!
            setTasks(newTasks)
          }
        } else {
          continue
        }
      } else {
        break
      }
    }
        setCurrentTask(null)
        dispatch(setMode('Prepare'))
  }

 let savePlan = useCallback(async function (){
    let new_plan: IPlan

    if(plan) {
      let overwrite = confirm("Do you want overwrite plan?")
      if(overwrite) {
        new_plan = {
          id : plan!.id,
          name : planName.value,
          date : date,
          tasks : tasks
        }

        let res = await api.client.update(plan.id,new_plan)
        let newData = plans.map((item)=>{
          if(item.id == res.id) {
            return res
          }
          return item
        })

        setPlans(newData)
      }
    } else {
      new_plan = {
        id : Math.random(),
        name : planName.value,
        date : date,
        tasks : tasks
      }

      if(planName.value) {
      if(new_plan.tasks.length) {
        let res = await api.client.add(new_plan)
        setPlans([...plans,res])
        setPlan(res)
      } else {
        alert("Cannot save plan without tasks")
      }
    } else {
      alert("Please, entry a plan name")
    }
    }
    

    
    
  },[date,planName.value,tasks])

  function n(value : string) {
    return function test(e : any) {
      if(e.code == "Enter") {
        addItem(value)
      }
    }
  }


  useEffect(()=>{
    let f = n(input.value)
    document.addEventListener('keydown',f)
    return () => document.removeEventListener('keydown',f)
  },[input.value])

  useEffect(()=>{
    if(tasks) {
      let sum = tasks.reduce((a,b) =>a + b.work_time + b.break_time,0)
      setTotal(sum)
    }
  },[tasks])

  
  return (
    <div className="App">

      <div className="planner">
        <div className="planner__col main">
          <div className='planner__header'>
          <Input className='planner__plan-name' {...planName} placeholder='Plan Name'></Input>
        </div>
        <div className="planner__wrapper">
          <List
        size="small"
        bordered
        dataSource={tasks || []}
        renderItem={(item, i) => 
        {
        return <Task 
        {...item}
        isCurrent={item.id === currentTask}
        onClick={() => deleteTask(item.id)}
        />}}
        className='planner__list'
        />
        </div>
        <div className="planner__footer">
            <div className="planner__new-task">
              <Input {...input} placeholder="Enter task" type="text" />
              <Button 
              onClick={()=>addItem(input.value)}
              type='primary'>Add Task</Button>
            </div>
            <div className="planner__row">
              <div className="timer">
                <div className="timer__title">
                  Work Time
                </div>
                <div className="timer__inputs">
                  <InputNumber
                  {...work_mins}
                  placeholder='Min'
                  className='timer__input'
                  />
                  :
                  <InputNumber 
                  {...work_secs}
                  defaultValue={2}
                  placeholder='Sec'
                  className='timer__input'
                  />
                </div>
              </div>
              <div className="timer">
                <div className="timer__title">
                  Break Time
                </div>
                <div className="timer__inputs">
                  <InputNumber
                  {...break_mins}
                  placeholder='Min'
                  className='timer__input'
                  />
                  :
                  <InputNumber 
                  {...break_secs}
                  defaultValue={2}
                  placeholder='Sec'
                  className='timer__input'
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="planner__row">
          <Button
          type='primary'
          disabled={app.mode != 'Prepare'}
          onClick={()=>(setTasks([]))}
          >Reset</Button>

          {total ? <div>{"Total " + toFormat(total)}</div> : ''}
          <Button type='primary'
          onClick={() => run()}
          disabled={!plan || plan.tasks.length == 0}
          >Run</Button>
          </div>

          {time ? <div className="timer">
            <Button onClick={() => toggleTaskTimer()} type='primary'>
              Stop/Start
              </Button>
            <div className="timer__value">
              {`${app.mode} ${toFormat(time)}`}
            </div>
          </div> : ''}


          <Calendar
          className='calendar'
          fullscreen={false}
           onSelect={onSelect} 
           headerRender={()=>{
            return <div className='calendar__header'>{date}</div>
           }}
           />

          <div className={"planner__row footer" + (!plan && ` text-end`)}>
            {plan ? <Button className='planner__btn'
            onClick={()=> deletePlan(plan!.id)}
            disabled={app.mode != 'Prepare'}
            type='primary'
            >
                Remove Plan
            </Button> : ''}

            {plan ? <Button
            type="primary"
            onClick={() => setPlan(null)}
            >
              New Plan
            </Button> : ''}

            <Button className='planner__btn save-btn'
            onClick={savePlan}  
            type='primary'>
              Save Plan
            </Button>  
          </div>
        </div>
        <div className="planner__col aside">
          <div className="planner__header center">
            Plans
          </div>
          <div className="planner__list">
            {
              plans
              .sort((a,b) => {
                return +(a.date.split('-').join('')) - +(b.date.split('-').join(''))
              })
              .map(item => {
                return <div className={'plan' + ((item.id == plan?.id) ? (' ' + 'current') : '')}
                key={item.id}
                onClick={()=> setPlan(item)}
                >
                  <div className="plan__name">
                    {item.name}
                  </div>
                  <div className="plan__date">
                    {item.date}
                  </div>
                </div>
              })
            }
          </div>
        </div>
      
        </div>
    </div>
  );
}

export default App;
