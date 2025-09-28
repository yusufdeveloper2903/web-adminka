import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useMeQuery } from "@/hooks/auth"
import { ProfileFormFields } from "./ProfileFormFields"
import { useProfileForm } from "../hooks"

interface ProfileDialogProps {
  isOpen: boolean
  onClose: () => void
}

// A component to render while the main content is loading
const LoadingState = () => (
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Edit Profile</DialogTitle>
    </DialogHeader>
    <div className="flex items-center justify-center py-10">
      <p>Loading...</p>
    </div>
  </DialogContent>
)

// A component to render the form once user data is available
const ProfileForm = ({
  user,
  onClose
}: {
  user: NonNullable<ReturnType<typeof useMeQuery>["data"]>
  onClose: () => void
}) => {
  const { form, isPending } = useProfileForm({ user, onClose })

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Edit Profile</DialogTitle>
      </DialogHeader>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
      >
        <div className="py-4">
          <ProfileFormFields form={form} user={user} />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}

export const ProfileDialog = ({ isOpen, onClose }: ProfileDialogProps) => {
  const { data: user, isLoading } = useMeQuery(isOpen)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {isLoading || !user ? <LoadingState /> : <ProfileForm user={user} onClose={onClose} />}
    </Dialog>
  )
}
