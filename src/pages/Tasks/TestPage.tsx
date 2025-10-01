import { useEffect, useState } from "react"
import CreateTaskQuestionForm from "./components/CreateTaskQuestionForm"
import { useHeaderStore } from "@/store"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { CheckCircle } from "lucide-react"

const TasksTestPage = () => {
  const { setConfig, resetConfig } = useHeaderStore()
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [taskId, setTaskId] = useState<number | null>(null)

  useEffect(() => {
    setConfig({ title: "Questions", metadata: undefined, actions: [], filters: [] })
  }, [setConfig])

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
