import { useEffect } from "react"
import CreateTaskQuestionForm from "./components/CreateTaskQuestionForm"
import { useHeaderStore } from "@/store"

const TasksTestPage = () => {
  const { setConfig, resetConfig } = useHeaderStore()

  useEffect(() => {
    setConfig({ title: "Questions", metadata: undefined, actions: [], filters: [] })
  }, [setConfig])

  useEffect(() => {
    return () => resetConfig()
  }, [resetConfig])

  return (
    <div className="p-4">
      <CreateTaskQuestionForm />
    </div>
  )
}

export default TasksTestPage
