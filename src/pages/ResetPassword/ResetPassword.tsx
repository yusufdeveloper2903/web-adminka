import { useState, useEffect } from "react"
import { useForm } from "@tanstack/react-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { EyeIcon, EyeOffIcon, LockIcon, TruckIcon, ArrowLeftIcon } from "lucide-react"
import { z } from "zod"
import { useResetPasswordFinishMutation } from "@/hooks/auth"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const ResetPassword = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [token, setToken] = useState("")

  const resetPasswordMutation = useResetPasswordFinishMutation()

  // Extract email and token from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const emailParam = urlParams.get("email")
    const tokenParam = urlParams.get("token")

    if (emailParam) setEmail(emailParam)
    if (tokenParam) setToken(tokenParam)

    if (!emailParam || !tokenParam) {
      toast.error("Invalid reset password link. Please request a new one.")
    }
  }, [])

  // Zod schema for validation
  const resetPasswordSchema = z
    .object({
      newPassword: z
        .string()
        .min(1, "Password is required")
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/\d/, "Password must contain at least one number"),
      confirmPassword: z.string().min(1, "Please confirm your password")
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"]
    })

  const form = useForm({
    defaultValues: {
      newPassword: "",
      confirmPassword: ""
    },
    onSubmit: async ({ value }) => {
      try {
        // Validate form data with Zod
        const validatedData = resetPasswordSchema.parse(value)

        if (!email || !token) {
          toast.error("Missing email or token. Please use a valid reset link.")
          return
        }

        // Reset password
        const resetData = {
          email,
          token,
          newPassword: validatedData.newPassword,
          confirmPassword: validatedData.confirmPassword
        }

        resetPasswordMutation.mutate(resetData, {
          onSuccess: () => {
            // Redirect to login after successful reset
            setTimeout(() => {
              window.location.href = "/login"
            }, 2000)
          }
        })
      } catch (error: any) {
        if (error instanceof z.ZodError) {
          console.error("Validation errors:", error.errors)
          toast.error("Please check your input and try again.")
        }
      }
    }
  })

  return (
    <div className="flex min-h-screen w-full flex-col bg-gradient-to-br from-blue-50 to-indigo-100 p-6 dark:from-slate-900 dark:to-slate-800">
      <div className="mx-auto w-full max-w-md flex-1">
        <div className="flex min-h-full flex-col justify-between">
          {/* Brand Section */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0E416C] shadow-lg">
              <TruckIcon className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">GL MILER</h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Fleet Management System</p>
          </div>

          <Card className="border-slate-200 bg-white/95 shadow-xl backdrop-blur-sm dark:border-slate-700 dark:bg-slate-800/95">
            <CardHeader className="pt-8 pb-4 text-center">
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Reset Password</h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Enter your new password below</p>
            </CardHeader>

            <CardContent className="space-y-6">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  form.handleSubmit()
                }}
                className="space-y-4"
              >
                {/* New Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-slate-700 dark:text-slate-300">
                    New Password
                  </Label>
                  <div className="relative">
                    <form.Field
                      name="newPassword"
                      children={(field) => {
                        const passwordResult = resetPasswordSchema.shape.newPassword.safeParse(field.state.value)
                        const hasError = field.state.meta.isTouched && !passwordResult.success

                        return (
                          <>
                            <LockIcon
                              className={cn(
                                "absolute left-3 h-4 w-4 text-slate-400 dark:text-slate-500",
                                hasError ? "top-3" : "top-1/2 -translate-y-1/2"
                              )}
                            />
                            <Input
                              id="newPassword"
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter new password"
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) => field.handleChange(e.target.value)}
                              className={`h-11 pr-10 pl-10 ${hasError ? "border-red-500" : ""}`}
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className={cn(
                                "absolute right-3 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300",
                                hasError ? "top-3" : "top-1/2 -translate-y-1/2"
                              )}
                            >
                              {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                            </button>
                            {hasError && (
                              <div className="mt-1 text-sm text-red-500">
                                {passwordResult.success ? "" : passwordResult.error.errors[0]?.message}
                              </div>
                            )}
                          </>
                        )
                      }}
                    />
                  </div>
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-slate-700 dark:text-slate-300">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <form.Field
                      name="confirmPassword"
                      children={(field) => {
                        const confirmResult = resetPasswordSchema.safeParse({
                          newPassword: form.state.values.newPassword,
                          confirmPassword: field.state.value
                        })
                        const hasError = field.state.meta.isTouched && !confirmResult.success

                        return (
                          <>
                            <LockIcon
                              className={cn(
                                "absolute left-3 h-4 w-4 text-slate-400 dark:text-slate-500",
                                hasError ? "top-3" : "top-1/2 -translate-y-1/2"
                              )}
                            />
                            <Input
                              id="confirmPassword"
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="Confirm new password"
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) => field.handleChange(e.target.value)}
                              className={`h-11 pr-10 pl-10 ${hasError ? "border-red-500" : ""}`}
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className={cn(
                                "absolute right-3 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300",
                                hasError ? "top-3" : "top-1/2 -translate-y-1/2"
                              )}
                            >
                              {showConfirmPassword ? (
                                <EyeOffIcon className="h-4 w-4" />
                              ) : (
                                <EyeIcon className="h-4 w-4" />
                              )}
                            </button>
                            {hasError && (
                              <div className="mt-1 text-sm text-red-500">
                                {confirmResult.success
                                  ? ""
                                  : confirmResult.error.errors.find((e) => e.path.includes("confirmPassword"))?.message}
                              </div>
                            )}
                          </>
                        )
                      }}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="default"
                  className="w-full bg-[#0E416C] hover:bg-[#0E416C]/90"
                  disabled={form.state.isSubmitting || resetPasswordMutation.isPending}
                >
                  {form.state.isSubmitting || resetPasswordMutation.isPending
                    ? "Resetting Password..."
                    : "Reset Password"}
                </Button>

                {/* Back to Login */}
                <div className="text-center">
                  <a
                    href="/login"
                    className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline dark:text-blue-400"
                  >
                    <ArrowLeftIcon className="h-4 w-4" />
                    Back to Login
                  </a>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              © {new Date().getFullYear()} GL Miler. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword
