import { useEffect, useState } from "react"
import CreateTaskQuestionForm from "./components/CreateTaskQuestionForm"
import { useHeaderStore } from "@/store"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { CheckCircle, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

const TasksTestPage = () => {
  const { setConfig, resetConfig } = useHeaderStore()
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [taskId, setTaskId] = useState<number | null>(null)
  const { setTheme, theme } = useTheme()

  useEffect(() => {
    setConfig({ 
      title: "Questions", 
      metadata: undefined, 
      actions: [
        {
          id: "theme-toggle",
          label: "",
          onClick: () => setTheme(theme === "light" ? "dark" : "light"),
          variant: "outline",
          icon: theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />
        }
      ], 
      filters: [] 
    })
  }, [setConfig, setTheme, theme])

  useEffect(() => {
    return () => resetConfig()
  }, [resetConfig])

  const handleSuccess = (task: number) => {
    setTaskId(task)
    setShowSuccessModal(true)
  }

  return (
    <div className="p-4">
      <CreateTaskQuestionForm onSuccess={handleSuccess} />
      
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <DialogTitle className="text-center text-xl font-semibold">
              Success!
            </DialogTitle>
            <DialogDescription className="text-center text-base">
              Questions created successfully!
              {taskId && (
                <span className="block mt-3 text-lg font-semibold text-foreground">
                  Test Code: {taskId}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default TasksTestPage
