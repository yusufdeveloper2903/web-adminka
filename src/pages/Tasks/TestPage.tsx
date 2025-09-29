import { useEffect, useMemo } from "react"
import CreateTaskQuestionForm from "./components/CreateTaskQuestionForm"
import { useHeaderStore } from "@/store"
import { useParams } from "@tanstack/react-router"
import { useTaskQuestionsInfiniteQuery } from "@/hooks"

const TasksTestPage = () => {
  const { id } = useParams({ from: "/authenticated/layout/tasks/$id" })
  const { setConfig, resetConfig } = useHeaderStore()


  const { data } = useTaskQuestionsInfiniteQuery({ task: id })
  const initialQuestions = useMemo(() => {
    const list = data?.pages?.[0]?.content ?? []
    if (!list?.length) return undefined
    // Map API -> form Question shape
    return list.map((q: any, i: number) => ({
      index: q.index ?? i,
      answer: q.answer ?? "",
      type: q.type ?? (Array.isArray(q.option) && q.option.length ? "CHOICE" : "WRITTEN"),
      option: q.option ?? (q.type === "WRITTEN" ? [] : ["", "", "", ""]),
      point: q.point ?? null,
      dop_point: q.dop_point ?? null
    }))
  }, [data])

  const title = (initialQuestions && initialQuestions.length) ? "Update Test" : "Create Test"

  useEffect(() => {
    setConfig({ title, metadata: undefined, actions: [], filters: [] })
  }, [setConfig, title])

  useEffect(() => {
    return () => resetConfig()
  }, [resetConfig])

  return (
    <div className="p-4">
      <CreateTaskQuestionForm defaultTaskId={Number(id)} initialQuestions={initialQuestions} />
    </div>
  )
}

export default TasksTestPage
