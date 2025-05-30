import TaskInfoTable from "./Components/TaskInfoTable"

const TaskInfo = () => {
  return (
    <>
      <div className='text-xl text-center font-semibold text-orange-400 p-2 rounded-md bg-gray-200'>
        All Tasks
      </div>
      <TaskInfoTable />
    </>
  )
}

export default TaskInfo
