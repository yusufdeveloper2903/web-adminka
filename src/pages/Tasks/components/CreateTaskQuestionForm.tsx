import { useState, useMemo, useEffect, useRef } from "react"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useDrawerStore } from "@/store"
import { z } from "zod"
import { useCreateQuestionMutation, useUpdateQuestionsMutation } from "@/hooks/tasks/mutations"
import { useLocation } from "@tanstack/react-router"
// import { Keyboard } from "lucide-react"

const optionSchema = z.string().min(1)

const questionItemSchema = z
  .object({
    answer: z.string().min(1),
    type: z.enum(["CHOICE", "WRITTEN"]),
    option: z.array(optionSchema),
    index: z.number().int().min(0),
    point: z.number().nullable(),
    dop_point: z.number().nullable()
  })
  .superRefine((val, ctx) => {
    if (val.type === "CHOICE") {
      const nonEmptyOptions = (val.option || []).filter((o) => o && o.trim() !== "")
      if (nonEmptyOptions.length < 3) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "At least 3 options are required", path: ["option"] })
      }
      if (!nonEmptyOptions.includes(val.answer)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Answer must be one of options", path: ["answer"] })
      }
    }
  })

const createSchema = z.object({
  task: z.coerce.number().int().min(1),
  question_data: z.array(questionItemSchema).min(1)
})

type Question = z.infer<typeof questionItemSchema>

const createEmptyQuestion = (index: number): Question => ({
  answer: "",
  type: "CHOICE",
  option: ["", "", "", ""],
  index,
  point: null,
  dop_point: null
})

const normalizeChoiceQuestion = (q: Question): Question => {
  if (q.type !== "CHOICE") return q
  const nonEmptyOptions = (q.option || []).filter((o) => typeof o === "string") as string[]
  let nextOptions = [...nonEmptyOptions]
  if (q.answer && !nextOptions.includes(q.answer)) {
    nextOptions = [q.answer, ...nextOptions]
  }
  while (nextOptions.length < 3) nextOptions.push("")
  return { ...q, option: nextOptions }
}

const CreateTaskQuestionForm = ({
  defaultTaskId,
  initialQuestion,
  initialQuestions
}: {
  defaultTaskId?: number
  initialQuestion?: Partial<Question>
  initialQuestions?: Partial<Question>[]
}) => {
  const { closeDrawer } = useDrawerStore()
  const mutation = useCreateQuestionMutation()
  const updateMutation = useUpdateQuestionsMutation()
  const location = useLocation()
  const matched = location.pathname.match(/\/tasks\/(\d+)/)
  const routeTaskId = Number(matched?.[1] ?? 0)
  const resolvedTaskId = defaultTaskId ?? routeTaskId
  const isUpdateMode = Boolean(initialQuestion || (initialQuestions && initialQuestions.length))

  const [questions, setQuestions] = useState<Question[]>(() => {
    const arr = (
      initialQuestions && initialQuestions.length ? initialQuestions : initialQuestion ? [initialQuestion] : []
    ) as Partial<Question>[]
    if (arr && arr.length) {
      const mapped = arr.map((q, i) =>
        normalizeChoiceQuestion({
          ...createEmptyQuestion(q.index ?? i),
          ...q,
          type: (q as any)?.type ?? "CHOICE",
          option:
            (q as any)?.type === "WRITTEN"
              ? []
                : (q as any)?.option && (q as any)?.option?.length
                ? ((q as any)?.option as any)
                : ["", "", "", ""]
        } as Question)
      )
      return mapped
    }
    return [createEmptyQuestion(0)]
  })
  const mathRefs = useRef<Record<number, any>>({})

  useEffect(() => {
    import("@gotitinc/mathlive").catch(() => undefined)
  }, [])

  useEffect(() => {
    if (initialQuestions) {
      const arr = initialQuestions as Partial<Question>[]
      if (arr.length) {
        const mapped = arr.map((q, i) =>
          normalizeChoiceQuestion({
            ...createEmptyQuestion(q.index ?? i),
            ...q,
            type: (q as any)?.type ?? "CHOICE",
            option:
              (q as any)?.type === "WRITTEN"
                ? []
                : (q as any)?.option && (q as any)?.option?.length
                  ? ((q as any)?.option as any)
                  : ["", "", "", ""]
          } as Question)
        )
        setQuestions(mapped)
      } else {
        setQuestions([createEmptyQuestion(0)])
      }
    } else if (initialQuestion) {
      const mapped = normalizeChoiceQuestion({
        ...createEmptyQuestion(initialQuestion.index ?? 0),
        ...initialQuestion,
        type: (initialQuestion as any)?.type ?? "CHOICE",
        option:
          (initialQuestion as any)?.type === "WRITTEN"
            ? []
            : (initialQuestion as any)?.option && (initialQuestion as any)?.option?.length
              ? ((initialQuestion as any)?.option as any)
              : ["", "", "", ""]
      } as Question)
      setQuestions([mapped])
    }
  }, [initialQuestions, initialQuestion])

  // inline math-field used without persistent virtual keyboard state

  const canSubmit = useMemo(() => {
    try {
      const normalized = questions.map((q) => normalizeChoiceQuestion(q))
      createSchema.parse({ task: resolvedTaskId, question_data: normalized })
      return true
    } catch {
      return false
    }
  }, [questions, resolvedTaskId])

  const updateQuestion = (idx: number, updater: (q: Question) => Question) => {
    setQuestions((prev) => prev.map((q, i) => (i === idx ? updater(q) : q)))
  }

  const addQuestion = () => {
    setQuestions((prev) => [...prev, createEmptyQuestion(prev.length)])
  }

  const removeQuestion = (idx: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== idx).map((q, i) => ({ ...q, index: i })))
  }

  const addOption = (qIdx: number) => {
    updateQuestion(qIdx, (q) => ({ ...q, option: [...q.option, ""] }))
  }

  const removeOption = (qIdx: number, optIdx: number) => {
    updateQuestion(qIdx, (q) => {
      if (q.option.length <= 3) return q
      const newOpts = q.option.filter((_, i) => i !== optIdx)
      const newAnswer = q.type === "CHOICE" && !newOpts.includes(q.answer) ? "" : q.answer
      return { ...q, option: newOpts, answer: newAnswer }
    })
  }

  const handleSubmit = async () => {
    const normalized = questions.map((q) => normalizeChoiceQuestion(q))
    const payload = createSchema.parse({ task: resolvedTaskId, question_data: normalized })
    if (isUpdateMode) {
      await updateMutation.mutateAsync({ task_id: resolvedTaskId, question_data: payload.question_data as any })
    } else {
      await mutation.mutateAsync(payload)
    }
    closeDrawer()
  }

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-5">
          {questions.map((q, qIdx) => (
            <div key={qIdx} className="rounded-md border p-4">
              <div className="mb-3 flex items-center justify-between">
                <Label className="text-base font-semibold">Question #{qIdx + 1}</Label>
                {questions.length > 1 && (
                  <Button variant="ghost" onClick={() => removeQuestion(qIdx)}>
                    Remove
                  </Button>
                )}
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-1 gap-3">
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <select
                      className="h-9 w-full rounded-md border px-3"
                      value={q.type}
                      onChange={(e) =>
                        updateQuestion(qIdx, (prev) => ({
                          ...prev,
                          type: e.target.value as Question["type"],
                          answer: "",
                          option: e.target.value === "WRITTEN" ? [] : prev.option.length ? prev.option : ["", "", "", ""]
                        }))
                      }
                    >
                      <option value="CHOICE">CHOICE</option>
                      <option value="WRITTEN">WRITTEN</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Answer</Label>
                    {q.type === "WRITTEN" ? (
                      <div className="relative">
                        {/* @ts-expect-error web component */}
                        <math-field
                          ref={(el: any) => {
                            if (!el) return
                            mathRefs.current[qIdx] = el
                            try {
                              if (typeof el.setOptions === "function") {
                                el.setOptions({ virtualKeyboardMode: "manual" })
                              }
                              if (el.value !== q.answer) {
                                el.value = q.answer || ""
                              }
                            } catch {
                              /* ignore */
                            }
                          }}
                          onInput={(e: any) => {
                            try {
                              const value = (e?.target as any)?.value ?? ""
                              if (value !== q.answer) {
                                updateQuestion(qIdx, (prev) => ({ ...prev, answer: value }))
                              }
                            } catch {
                              /* ignore */
                            }
                          }}
                          className="w-full rounded-md border px-3 py-2 text-base"
                          style={{ minHeight: 36 }}
                        />
                      </div>
                    ) : (
                      <Input
                        placeholder="Enter answer option"
                        value={q.answer}
                        onChange={(e) => updateQuestion(qIdx, (prev) => ({ ...prev, answer: e.target.value }))}
                      />
                    )}
                  </div>
                </div>

                {q.type === "CHOICE" && (
                  <div className="space-y-2">
                    <Label>Options</Label>
                    <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                      {q.option.map((opt, optIdx) => (
                        <div key={optIdx} className="relative">
                          <Input
                            placeholder={`Option ${optIdx + 1}`}
                            value={opt}
                            className="pr-8"
                            onChange={(e) =>
                              updateQuestion(qIdx, (prev) => {
                                const next = [...prev.option]
                                next[optIdx] = e.target.value
                                return { ...prev, option: next }
                              })
                            }
                          />
                          {q.option.length > 3 && (
                            <Button
                              variant="ghost"
                              className="absolute right-1 top-2 h-5 w-5 p-0"
                              onClick={() => removeOption(qIdx, optIdx)}
                              aria-label={`Remove option ${optIdx + 1}`}
                              title="Remove option"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                    <Button variant="outline" onClick={() => addOption(qIdx)}>
                      Add option
                    </Button>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Point</Label>
                    <Input
                      type="number"
                      value={q.point ?? ""}
                      onChange={(e) =>
                        updateQuestion(qIdx, (prev) => ({
                          ...prev,
                          point: e.target.value === "" ? null : Number(e.target.value)
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Dop point</Label>
                    <Input
                      type="number"
                      value={q.dop_point ?? ""}
                      onChange={(e) =>
                        updateQuestion(qIdx, (prev) => ({
                          ...prev,
                          dop_point: e.target.value === "" ? null : Number(e.target.value)
                        }))
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <Button type="button" variant="secondary" onClick={addQuestion}>
            Add new test
          </Button>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={closeDrawer}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={mutation.isPending || updateMutation.isPending || !canSubmit}
              onClick={handleSubmit}
            >
              {mutation.isPending || updateMutation.isPending
                ? isUpdateMode
                  ? "Updating..."
                  : "Creating..."
                : isUpdateMode
                  ? "Update"
                  : "Create"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateTaskQuestionForm
