import { useEffect, useMemo, useRef, useState } from "react"
import { useHeaderStore } from "@/store"
import { useNavigate } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { useCheckTaskMutation, useClientSolvingTestMutation } from "@/hooks/tasks/mutations"
import { toast } from "sonner"
import { getErrorMessage } from "@/lib/error-utils"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CheckCircle } from "lucide-react"

type QuestionKind = "CHOICE" | "WRITTEN"

interface FetchedQuestion {
  id: number
  option: string[]
  type: QuestionKind
  index: number
}

const TestSolvePage = () => {
  const { setConfig, resetConfig } = useHeaderStore()
  const [questions, setQuestions] = useState<FetchedQuestion[]>([])
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [showResultModal, setShowResultModal] = useState<boolean>(false)
  const [solveResult, setSolveResult] = useState<any>(null)

  const checkTask = useCheckTaskMutation()
  const submitAnswers = useClientSolvingTestMutation()

  const navigate = useNavigate()

  const userId = useMemo(() => {
    try {
      const p = new URLSearchParams(window.location.search)
      const id = p.get("user_id")
      return id ? Number(id) : undefined
    } catch {
      return undefined
    }
  }, [])

  const testCodeFromPath = useMemo(() => {
    try {
      const match = window.location.pathname.match(/\/tests\/(\d+)/)
      return match ? match[1] : undefined
    } catch {
      return undefined
    }
  }, [])

  const mathRefs = useRef<Record<number, any>>({})
  const autoFetchedRef = useRef(false)

  useEffect(() => {
    setConfig({ title: "Check Answers", actions: [], filters: [], metadata: undefined })
  }, [setConfig])

  useEffect(() => {
    return () => {
      resetConfig()
    }
  }, [resetConfig])

  useEffect(() => {
    import("mathlive").catch(() => undefined)
  }, [])

  useEffect(() => {
    const autoFetch = async () => {
      if (autoFetchedRef.current) return
      if (!userId || !testCodeFromPath) return
      autoFetchedRef.current = true
      setIsLoading(true)
      try {
        const res = await checkTask.mutateAsync({ tg_id: userId, task_number: testCodeFromPath })
        const list = (res?.questions ?? []) as FetchedQuestion[]
        setQuestions(list)
      } catch (error: any) {
        const serverMsg = error?.response?.data?.msg || error?.response?.data?.message || error?.response?.data?.detail
        toast.error(serverMsg || getErrorMessage(error))
      } finally {
        setIsLoading(false)
      }
    }
    void autoFetch()
  }, [userId, testCodeFromPath, checkTask])

  const handleFinish = async () => {
    if (!userId || !testCodeFromPath) return
    const payload = {
      tg_id: userId,
      data: {
        task_number: Number(testCodeFromPath),
        answers: Object.entries(answers).map(([qid, value]) => ({ question: Number(qid), answer: value }))
      }
    }
    try {
      const response = await submitAnswers.mutateAsync(payload)
      setSolveResult(response)
      setShowResultModal(true)
    } catch (error: any) {
      const serverMsg = error?.response?.data?.msg || error?.response?.data?.message || error?.response?.data?.detail
      toast.error(serverMsg || getErrorMessage(error))
    }
  }

  if (isLoading) {
    return (
      <div className="p-4">
        <Card className="space-y-6">
          <CardHeader>
            <CardTitle className="text-center text-3xl font-extrabold tracking-tight">Check Answers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 sm:max-w-xl">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-11 w-full" />
              <div className="grid grid-cols-4 gap-3">
                <Skeleton className="h-11" />
                <Skeleton className="h-11" />
                <Skeleton className="h-11" />
                <Skeleton className="h-11" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-4">
      <Card className="space-y-6">
        <CardHeader>
          <CardTitle className="text-center text-3xl font-extrabold tracking-tight">
            Check Answers
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {questions.map((q, idx) => (
            <div key={q.id} className="grid grid-cols-[auto_1fr] items-center gap-3">
              <div className="font-medium w-6 text-right">{idx + 1}.</div>
              {q.type === "CHOICE" ? (
                <div className="grid grid-cols-4 gap-3 sm:max-w-xl">
                  {q.option.map((o, i) => (
                    <Button
                      key={i}
                      size="lg"
                      className="h-11"
                      variant={answers[q.id] === o ? "default" : "outline"}
                      onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: o }))}
                    >
                      {o}
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="flex items-center">
                  {/* @ts-expect-error web component */}
                  <math-field
                    ref={(el: any) => {
                      if (!el) return
                      mathRefs.current[q.id] = el
                      try {
                        if (typeof el.setOptions === "function") {
                          el.setOptions({ virtualKeyboardMode: "manual" })
                        }
                      } catch {
                        /* ignore */
                      }
                    }}
                    value={answers[q.id] ?? ""}
                    onInput={(e: any) => {
                      try {
                        const value = (e?.target as any)?.value ?? ""
                        setAnswers((prev) => ({ ...prev, [q.id]: value }))
                      } catch {
                        /* ignore */
                      }
                    }}
                    className="w-full rounded-md border px-3 py-2 text-base"
                    style={{ minHeight: 36 }}
                  />
                </div>
              )}
            </div>
          ))}
          <div className="pt-2 space-y-3 w-full">
            <Button
              variant="outline"
              className="h-12 w-full text-base gap-2"
              onClick={() => {
                if (userId) {
                  void navigate({ to: "/tests" as any, search: { user_id: userId } as any })
                } else {
                  void navigate({ to: "/tests" as any })
                }
              }}
            >
              <ArrowLeft className="h-4 w-4" /> Go Back
            </Button>
            <Button
              className="h-12 w-full text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600"
              onClick={handleFinish}
              disabled={submitAnswers.isPending}
            >
              {submitAnswers.isPending ? "Submitting..." : "Finish"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={showResultModal}
        onOpenChange={(open) => {
          setShowResultModal(open)
          if (!open) {
            if (userId) {
              void navigate({ to: "/tests" as any, search: { user_id: userId } as any })
            } else {
              void navigate({ to: "/tests" as any })
            }
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <DialogTitle className="text-center text-xl font-semibold">Success!</DialogTitle>
            <DialogDescription className="text-center text-base space-y-2">
              {solveResult?.total_point !== undefined && (
                <span className="block">Total point: <b>{solveResult.total_point}</b></span>
              )}
              {(solveResult?.correct_answer_count !== undefined || solveResult?.incorrect_answer_count !== undefined) && (
                <span className="block">
                  Correct: <b>{solveResult?.correct_answer_count ?? 0}</b> | Incorrect: <b>{solveResult?.incorrect_answer_count ?? 0}</b>
                </span>
              )}
              {Array.isArray(solveResult?.result) && solveResult.result.length > 0 && (
                <div className="mt-3 text-left">
                  <div className="font-medium mb-1">Answers</div>
                  <div className="space-y-1 max-h-60 overflow-auto">
                    {solveResult.result.map((r: any, i: number) => (
                      <div key={i} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                        <span>Q{(r?.index ?? i) + 1}</span>
                        <span className={r?.is_correct ? "text-green-600" : "text-red-600"}>
                          {r?.is_correct ? "Correct" : "Incorrect"} {r?.point !== undefined ? `( +${r.point} )` : ""}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default TestSolvePage


