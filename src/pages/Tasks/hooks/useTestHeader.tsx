import { useEffect } from "react"
import { Plus } from "lucide-react"
import { useHeaderStore, useDrawerStore } from "@/store"
import CreateTaskQuestionForm from "../components/CreateTaskQuestionForm"

interface UseTestHeaderParams {
  totalDBRowCount: number
}

const useTestHeader = ({ totalDBRowCount }: UseTestHeaderParams) => {
  const { setConfig: setHeaderConfig, resetConfig } = useHeaderStore()
  const { setConfig: setDrawerConfig } = useDrawerStore()

  useEffect(() => {
    setHeaderConfig({
      title: "Task Questions",
      metadata: `Total: ${totalDBRowCount} questions`,
      actions: [
        {
          id: "create_test",
          label: "Create Test",
          icon: <Plus className="mr-2 h-4 w-4" />,
          onClick: () =>
            setDrawerConfig({
              title: "Create Test",
              content: <CreateTaskQuestionForm />,
              width: "sm:max-w-4xl"
            })
        }
      ],
      filters: []
    })

    return () => resetConfig()
  }, [setHeaderConfig, resetConfig, setDrawerConfig, totalDBRowCount])
}

export default useTestHeader


