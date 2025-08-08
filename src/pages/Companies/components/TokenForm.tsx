import { Button } from "@/components/ui/button"
import { useTokenForm } from "../hooks/useTokenForm"
import type { ICompanyResponse } from "@/types"
import { TokenFormFields } from "."

interface TokenFormWrapperProps {
  company: ICompanyResponse
  onClose: () => void
}

const TokenForm = ({ company, onClose }: TokenFormWrapperProps) => {
  const { form, isSubmitting } = useTokenForm({ company })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    form.handleSubmit()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <TokenFormFields form={form} />

      <div className="flex justify-end space-x-3 border-t pt-4">
        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Updating..." : "Update Tokens"}
        </Button>
      </div>
    </form>
  )
}

export default TokenForm
