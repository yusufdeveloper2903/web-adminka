import { Button } from "@/components/ui/button"
import { useTokenForm } from "../hooks/useTokenForm"
import { TokenForm } from "./"
import type { ICompanyResponse } from "@/types"

interface TokenFormWrapperProps {
  company: ICompanyResponse
  onClose: () => void
}

const TokenFormWrapper = ({ company, onClose }: TokenFormWrapperProps) => {
  const { form, isSubmitting } = useTokenForm({ company })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    form.handleSubmit()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <TokenForm form={form} />
      
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Updating..." : "Update Tokens"}
        </Button>
      </div>
    </form>
  )
}

export default TokenFormWrapper