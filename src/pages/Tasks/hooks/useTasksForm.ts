import { useForm } from "@tanstack/react-form"
import { useEffect } from "react"
import { z } from "zod"
import { useDrawerStore, useTasksStore, useAuthStore } from "@/store"
import { useCreateTaskMutation, useUpdateTaskMutation } from "@/hooks"
import type { ITaskCreateRequest, ITaskResponse } from "@/types/tasks"

// Full schema used on submit (includes author)
const taskFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Max 255 characters"),
  number: z.string().min(1, "Number is required").max(10, "Max 10 characters"),
  author: z.coerce.number().int().min(1, "Author is required")
})

// Light schema for onChange validation (no author because it's hidden)
const taskChangeSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Max 255 characters"),
  number: z.string().min(1, "Number is required").max(10, "Max 10 characters")
})

interface UseTasksFormProps {
  task?: ITaskResponse
}

const useTasksForm = ({ task }: UseTasksFormProps = {}) => {
  const { closeDrawer } = useDrawerStore()
  const createTaskMutation = useCreateTaskMutation()
  const updateTaskMutation = useUpdateTaskMutation()

  const isEditing = !!task

  const { newTaskData, setNewTaskData, resetNewTaskData } = useTasksStore()

  const initialValues: ITaskCreateRequest = {
    title: "",
    number: "",
    author: 0
  }

  const form = useForm({
    defaultValues: isEditing
      ? {
          title: task!.title,
          number: task!.number,
          author: (task as any)?.author?.id ?? (task as any)?.author ?? 0
        }
      : { ...initialValues, ...(newTaskData as any) },
    validators: {
      onChange: taskChangeSchema as any
    },
    onSubmit: async ({ value }) => {
      try {
        // inject author from localStorage
        const authUser = useAuthStore.getState().user as any
        let authorId = authUser?.id

        if (!authorId) {
          try {
            const raw = typeof window !== "undefined" ? localStorage.getItem("user_data") : null
            const user = raw ? JSON.parse(raw) : null
            authorId = user?.id ?? user?._id ?? user?.user_id
          } catch {
            authorId = undefined as any
          }
        }

        const payload: ITaskCreateRequest = {
          ...value,
          author: Number(authorId || value.author)
        }

        const validatedData = taskFormSchema.parse(payload) as ITaskCreateRequest

        if (isEditing) {
          await updateTaskMutation.mutateAsync({ id: (task as any)?.id, data: validatedData })
          closeDrawer()
        } else {
          await createTaskMutation.mutateAsync(validatedData)
          closeDrawer()
          resetForm()
        }
      } catch (error) {
        if (error instanceof z.ZodError) {
          console.error("Validation errors:", error.errors)
        } else {
          console.error("Failed to save task:", error)
        }
      }
    }
  })

  useEffect(() => {
    if (isEditing) return
    const unsubscribe = (form as any).store.subscribe((state: any) => {
      if (state.values) setNewTaskData(state.values)
    })
    return unsubscribe
  }, [isEditing, form, setNewTaskData])

  useEffect(() => {
    return () => {
      if (!isEditing) {
        const latest = (form as any)?.state?.values
        if (latest) setNewTaskData(latest)
      }
    }
  }, [isEditing, form, setNewTaskData])

  const resetForm = () => {
    if (!isEditing) {
      resetNewTaskData()
    }
    form.reset()
  }

  return {
    form,
    resetForm,
    taskFormSchema,
    isSubmitting: isEditing ? updateTaskMutation.isPending : createTaskMutation.isPending,
    isEditing
  }
}

export default useTasksForm


