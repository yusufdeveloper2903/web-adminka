import { useEffect, useMemo, useRef, useState } from "react"
import { useHeaderStore } from "@/store"
import { useNavigate } from "@tanstack/react-router"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ClipboardCheck, Send, ArrowLeft } from "lucide-react"
import { Label } from "@/components/ui/label"
import { useCheckTaskMutation, useClientSolvingTestMutation, useCreateClientMutation } from "@/hooks/tasks/mutations"
import { toast } from "sonner"
import { getErrorMessage } from "@/lib/error-utils"

type QuestionKind = "CHOICE" | "WRITTEN"

interface FetchedQuestion {
  id: number
  option: string[]
  type: QuestionKind
  index: number
}

// no-op

const TestsPage = () => {
  const { setConfig, resetConfig } = useHeaderStore()
  const [taskNumber, setTaskNumber] = useState<string>("")
  // qolmagan: questions sahifada foydalanilmaydi
  const [questions] = useState<FetchedQuestion[]>([])
  const [step, setStep] = useState<"enter" | "solve">("enter")

  const checkTask = useCheckTaskMutation()
  const submitAnswers = useClientSolvingTestMutation()
  const createClient = useCreateClientMutation()

  const userId = useMemo(() => {
    try {
      const p = new URLSearchParams(window.location.search)
      const id = p.get("user_id")
      return id ? Number(id) : undefined
    } catch {
      return undefined
    }
  }, [])

  // URL pathdan test code ni o'qish: /tests/{code}
  const testCodeFromPath = (() => {
    try {
      const match = window.location.pathname.match(/\/tests\/(\d+)/)
      return match ? match[1] : undefined
    } catch {
      return undefined
    }
  })()

  const mountedClientRef = useRef(false)
  const mathRefs = useRef<Record<number, any>>({})
  // id-li sahifaga ko'chirildi (bu sahifada ishlatilmaydi)

  useEffect(() => {
    setConfig({ title: "Check Answers", actions: [], filters: [], metadata: undefined })
  }, [setConfig])

  useEffect(() => {
    return () => resetConfig()
  }, [resetConfig])

  // Mount paytida client yaratish (CreateTaskQuestionForm dagi kabi)
  useEffect(() => {
    if (typeof userId === "number" && !Number.isNaN(userId) && !mountedClientRef.current) {
      mountedClientRef.current = true
      createClient.mutate({ tg_id: userId })
    }
    import("mathlive").catch(() => undefined)
  }, [userId, createClient])

  // Agar URL da /tests/{code} bo'lsa, inputni to'ldirib, avtomatik tekshiramiz
  useEffect(() => {
    if (testCodeFromPath) {
      setTaskNumber(testCodeFromPath)
    }
  }, [testCodeFromPath])

  // Bu sahifada faqat kod kiritish va navigate bor, check_task bu yerda chaqirilmaydi
  useEffect(() => {
    if (testCodeFromPath) setTaskNumber(testCodeFromPath)
  }, [testCodeFromPath])

  const navigate = useNavigate()

  const handleCheck = async () => {
    if (!userId || !taskNumber) return
    try {
      await checkTask.mutateAsync({ tg_id: userId, task_number: taskNumber })
      await navigate({ to: "/tests/$testCode" as any, params: { testCode: taskNumber } as any, search: { user_id: userId } as any })
    } catch (error: any) {
      const serverMsg = error?.response?.data?.msg || error?.response?.data?.message || error?.response?.data?.detail
      toast.error(serverMsg || getErrorMessage(error))
    }
  }

  const [answers, setAnswers] = useState<Record<number, string>>({})

  const handleFinish = async () => {
    if (!userId || !taskNumber) return
    const payload = {
      tg_id: userId,
      data: {
        task_number: Number(taskNumber),
        answers: Object.entries(answers).map(([qid, value]) => ({ question: Number(qid), answer: value }))
      }
    }
    try {
      await submitAnswers.mutateAsync(payload)
    } catch (error: any) {
      const serverMsg = error?.response?.data?.msg || error?.response?.data?.message || error?.response?.data?.detail
      toast.error(serverMsg || getErrorMessage(error))
    }
  }

  return (
    <div className="p-4">
      {step === "enter" && (
        <Card className="mb-8 border-0 shadow-none bg-gradient-to-b from-blue-50 to-transparent dark:from-transparent">
          <CardHeader className="flex items-center">
            <div className="relative mb-2 mt-2 rounded-2xl border bg-background p-3 shadow-sm">
              <ClipboardCheck className="h-10 w-10" />
              <span className="absolute -right-1 -bottom-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white text-[10px]">✓</span>
            </div>
            <CardTitle className="text-center text-3xl font-extrabold tracking-tight">Check Answers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mx-auto w-full space-y-6">
              <div className="space-y-2">
                <Label className="text-base font-semibold">Test Code</Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="Enter test number"
                  value={taskNumber}
                  onChange={(e) => {
                    const onlyDigits = e.target.value.replace(/\D+/g, "")
                    setTaskNumber(onlyDigits)
                  }}
                  className="h-12 text-lg"
                />
              </div>
              <div className="flex flex-col gap-3">
                <Button
                  className="h-12 w-full text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600"
                  onClick={handleCheck}
                  disabled={checkTask.isPending || !taskNumber}
                >
                  {checkTask.isPending ? "Checking..." : "Check Answers"}
                </Button>
                <Button
                  variant="secondary"
                  className="h-12 w-full bg-gradient-to-r from-blue-400 to-blue-700 text-white"
                >
                  <Send className="h-5 w-5" /> Telegram
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {step === "solve" && (
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
                  setStep("enter")
                  if (userId) {
                    void navigate({ to: "/tests" as any, search: { user_id: userId } as any })
                  }
                }}
              >
                <ArrowLeft className="h-4 w-4" /> Go Back
              </Button>
              <Button className="h-12 w-full text-base font-semibold" onClick={handleFinish} disabled={submitAnswers.isPending}>
                {submitAnswers.isPending ? "Submitting..." : "Finish"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default TestsPage


