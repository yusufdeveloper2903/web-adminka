import { useState, useMemo, useEffect, useRef } from "react"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useDrawerStore } from "@/store"
import { z } from "zod"
import { useCreateQuestionMutation } from "@/hooks/tasks/mutations"

const DEFAULT_CHOICE_COUNT = 35
const DEFAULT_WRITTEN_COUNT = 10

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
  question_data: z.array(questionItemSchema).min(1)
})

type Question = z.infer<typeof questionItemSchema>

const createEmptyQuestion = (index: number): Question => ({
  answer: "",
  type: "CHOICE",
  option: ["A", "B", "C", "D"],
  index,
  point: null,
  dop_point: null
})

const createEmptyQuestionOfType = (index: number, type: Question["type"]): Question =>
  type === "WRITTEN"
    ? { answer: "", type: "WRITTEN", option: [], index, point: null, dop_point: null }
    : createEmptyQuestion(index)

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

interface CreateTaskQuestionFormProps {
  onSuccess?: (task: number) => void
}

const CreateTaskQuestionForm = ({ onSuccess }: CreateTaskQuestionFormProps) => {
  const { closeDrawer } = useDrawerStore()
  const mutation = useCreateQuestionMutation()

  // URL dan user_id ni o'qish
  const userId = useMemo(() => {
    try {
      const params = new URLSearchParams(window.location.search)
      const id = params.get("user_id")
      return id ? Number(id) : undefined
    } catch {
      return undefined
    }
  }, [])

  const [questions, setQuestions] = useState<Question[]>(() => {
    const total = DEFAULT_CHOICE_COUNT + DEFAULT_WRITTEN_COUNT
    const list: Question[] = []
    for (let i = 0; i < total; i++) {
      const type: Question["type"] = i < DEFAULT_CHOICE_COUNT ? "CHOICE" : "WRITTEN"
      list.push(createEmptyQuestionOfType(i, type))
    }
    return list
  })
  const mathRefs = useRef<Record<number, any>>({})

  useEffect(() => {
    import("mathlive").catch(() => undefined)
  }, [])

  const isQuestionComplete = (q: Question): boolean => {
    const answer = (q.answer || "").trim()
    if (answer.length === 0) return false
    // Points (0 ham valid)
    if (q.point === null || q.point === undefined || Number.isNaN(q.point as number)) return false
    if (q.dop_point === null || q.dop_point === undefined || Number.isNaN(q.dop_point as number)) return false
    // Choice specific
    if (q.type === "CHOICE") {
      const cleanedOptions = (q.option || []).map((o) => (o ?? "").trim()).filter((o) => o.length > 0)
      if (cleanedOptions.length < 3) return false
      const optionsLower = cleanedOptions.map((o) => o.toLowerCase())
      if (!optionsLower.includes(answer.toLowerCase())) return false
    }
    return true
  }

  const canSubmit = useMemo(() => {
    // Kamida bitta to'liq to'ldirilgan question bo'lsa bo'ldi
    return questions.some((q) => isQuestionComplete(q))
  }, [questions])

  const updateQuestion = (idx: number, updater: (q: Question) => Question) => {
    setQuestions((prev) => prev.map((q, i) => (i === idx ? updater(q) : q)))
  }

  const addQuestion = () => {
    setQuestions((prev) => [...prev, createEmptyQuestion(prev.length)])
  }

  const addWrittenQuestion = () => {
    setQuestions((prev) => [...prev, createEmptyQuestionOfType(prev.length, "WRITTEN")])
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
    // Barcha to'liq to'ldirilgan questionlarni index tartibida olish
    const validQuestions = questions
      .map((q, idx) => ({ question: q, originalIndex: idx }))
      .filter(({ question }) => isQuestionComplete(question))
      .sort((a, b) => a.originalIndex - b.originalIndex) // Index tartibida saralash
      .map(({ question }) => normalizeChoiceQuestion(question))
    
    if (validQuestions.length === 0) return
    const payload = createSchema.parse({ question_data: validQuestions })
    const finalPayload = { ...payload, user_id: userId }
    const response = await mutation.mutateAsync(finalPayload)

    // Response dan task ID ni olish
    if (response?.task && onSuccess) {
      onSuccess(response.task)
    }

    // Muvaffaqiyatli yaratilgandan keyin savollarni default holatiga qaytarish
    const total = DEFAULT_CHOICE_COUNT + DEFAULT_WRITTEN_COUNT
    const resetQuestions: Question[] = []
    for (let i = 0; i < total; i++) {
      const type: Question["type"] = i < DEFAULT_CHOICE_COUNT ? "CHOICE" : "WRITTEN"
      resetQuestions.push(createEmptyQuestionOfType(i, type))
    }
    setQuestions(resetQuestions)
  }

  const grouped = useMemo(() => {
    const choice: Array<{ q: Question; idx: number }> = []
    const written: Array<{ q: Question; idx: number }> = []
    questions.forEach((q, idx) => {
      if (q.type === "CHOICE") choice.push({ q, idx })
      else written.push({ q, idx })
    })
    return { choice, written }
  }, [questions])

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {grouped.choice.length > 0 && (
            <div className="sm:col-span-2 md:col-span-3 lg:col-span-4 xl:col-span-5">
              <Label className="text-muted-foreground text-sm font-semibold uppercase">Multiple Choice</Label>
            </div>
          )}
          {grouped.choice.map(({ q, idx }, localIdx) => (
            <div key={idx} className="rounded-md border p-4">
              <div className="mb-3 flex items-center justify-between">
                <Label className="text-base font-semibold">Question #{localIdx + 1}</Label>
                {questions.length > 1 && (
                  <Button variant="ghost" onClick={() => removeQuestion(idx)}>
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
                        updateQuestion(idx, (prev) => ({
                          ...prev,
                          type: e.target.value as Question["type"],
                          answer: "",
                          option: e.target.value === "WRITTEN" ? [] : ["A", "B", "C", "D"]
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
                            mathRefs.current[idx] = el
                            try {
                              if (typeof el.setOptions === "function") {
                                el.setOptions({ virtualKeyboardMode: "manual" })
                              }
                            } catch {
                              /* ignore */
                            }
                          }}
                          value={q.answer || ""}
                          onInput={(e: any) => {
                            try {
                              const value = (e?.target as any)?.value ?? ""
                              updateQuestion(idx, (prev) => ({ ...prev, answer: value }))
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
                        onChange={(e) => updateQuestion(idx, (prev) => ({ ...prev, answer: e.target.value }))}
                      />
                    )}
                  </div>
                </div>

                {q.type === "CHOICE" && (
                  <div className="space-y-2">
                    <Label>Options</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {q.option.map((opt, optIdx) => (
                        <div key={optIdx} className="relative">
                          <Input
                            placeholder={`Option ${optIdx + 1}`}
                            value={opt}
                            className="pr-8"
                            onChange={(e) =>
                              updateQuestion(idx, (prev) => {
                                const next = [...prev.option]
                                next[optIdx] = e.target.value
                                return { ...prev, option: next }
                              })
                            }
                          />
                          {q.option.length > 3 && (
                            <Button
                              variant="ghost"
                              className="absolute top-2 right-1 h-5 w-5 p-0"
                              onClick={() => removeOption(idx, optIdx)}
                              aria-label={`Remove option ${optIdx + 1}`}
                              title="Remove option"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                    <Button variant="outline" onClick={() => addOption(idx)}>
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
                        updateQuestion(idx, (prev) => ({
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
                        updateQuestion(idx, (prev) => ({
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

          {grouped.written.length > 0 && (
            <>
              <div className="sm:col-span-2 md:col-span-3 lg:col-span-4 xl:col-span-5">
                <Button type="button" variant="secondary" onClick={addQuestion}>
                  Add new test
                </Button>
              </div>
              <div className="sm:col-span-2 md:col-span-3 lg:col-span-4 xl:col-span-5">
                <Label className="text-muted-foreground text-sm font-semibold uppercase">Written</Label>
              </div>
            </>
          )}
          {grouped.written.map(({ q, idx }, localIdx) => (
            <div key={idx} className="rounded-md border p-4">
              <div className="mb-3 flex items-center justify-between">
                <Label className="text-base font-semibold">Question #{grouped.choice.length + localIdx + 1}</Label>
                {questions.length > 1 && (
                  <Button variant="ghost" onClick={() => removeQuestion(idx)}>
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
                        updateQuestion(idx, (prev) => ({
                          ...prev,
                          type: e.target.value as Question["type"],
                          answer: "",
                          option: e.target.value === "WRITTEN" ? [] : ["A", "B", "C", "D"]
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
                            mathRefs.current[idx] = el
                            try {
                              if (typeof el.setOptions === "function") {
                                el.setOptions({ virtualKeyboardMode: "manual" })
                              }
                            } catch {
                              /* ignore */
                            }
                          }}
                          value={q.answer || ""}
                          onInput={(e: any) => {
                            try {
                              const value = (e?.target as any)?.value ?? ""
                              updateQuestion(idx, (prev) => ({ ...prev, answer: value }))
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
                        onChange={(e) => updateQuestion(idx, (prev) => ({ ...prev, answer: e.target.value }))}
                      />
                    )}
                  </div>
                </div>

                {q.type === "CHOICE" && (
                  <div className="space-y-2">
                    <Label>Options</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {q.option.map((opt, optIdx) => (
                        <div key={optIdx} className="relative">
                          <Input
                            placeholder={`Option ${optIdx + 1}`}
                            value={opt}
                            className="pr-8"
                            onChange={(e) =>
                              updateQuestion(idx, (prev) => {
                                const next = [...prev.option]
                                next[optIdx] = e.target.value
                                return { ...prev, option: next }
                              })
                            }
                          />
                          {q.option.length > 3 && (
                            <Button
                              variant="ghost"
                              className="absolute top-2 right-1 h-5 w-5 p-0"
                              onClick={() => removeOption(idx, optIdx)}
                              aria-label={`Remove option ${optIdx + 1}`}
                              title="Remove option"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                    <Button variant="outline" onClick={() => addOption(idx)}>
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
                        updateQuestion(idx, (prev) => ({
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
                        updateQuestion(idx, (prev) => ({
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
          <Button type="button" variant="secondary" onClick={addWrittenQuestion}>
            Add new test
          </Button>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={closeDrawer}>
              Cancel
            </Button>
            <Button type="button" disabled={mutation.isPending || !canSubmit} onClick={handleSubmit}>
              {mutation.isPending ? "Creating..." : "Create"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateTaskQuestionForm
