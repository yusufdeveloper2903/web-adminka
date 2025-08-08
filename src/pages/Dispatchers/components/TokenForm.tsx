import { Button } from "@/components/ui/button"
import { useTokenForm } from "../hooks/useTokenForm"
import TokenFormFields from "./TokenFormFields"
import type { IDispatcherResponse } from "@/types"

interface TokenFormProps {
  dispatcher: IDispatcherResponse
  onClose?: () => void
}

const TokenForm = ({ dispatcher, onClose }: TokenFormProps) => {
  const { form, isSubmitting } = useTokenForm({ dispatcher })

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-muted-foreground text-sm">
          Update Samsara and GLE tokens for {dispatcher.firstName} {dispatcher.lastName}
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
        className="space-y-4"
      >
        <TokenFormFields form={form} />

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Updating..." : "Update Tokens"}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default TokenForm
