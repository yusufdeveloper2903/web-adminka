import { useEffect } from "react"
import CreateTaskQuestionForm from "./components/CreateTaskQuestionForm"
import { useHeaderStore } from "@/store"
import { useParams } from "@tanstack/react-router"

const TasksTestPage = () => {
  const { id } = useParams({ from: "/authenticated/layout/tasks/$id" })
  const { setConfig, resetConfig } = useHeaderStore()

  useEffect(() => {
    setConfig({ title: "Create Test", metadata: undefined, actions: [], filters: [] })
    return () => resetConfig()
  }, [setConfig, resetConfig])

  return (
    <div className="p-4">
      <CreateTaskQuestionForm defaultTaskId={Number(id)} />
    </div>
  )
}

export default TasksTestPage


