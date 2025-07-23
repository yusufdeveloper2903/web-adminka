import { useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { useForm } from "@tanstack/react-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { EyeIcon, EyeOffIcon, MailIcon, TruckIcon, LockIcon, LockOpenIcon } from "lucide-react"
import { z } from "zod"
import { useAuthenticateMutation, useResetPasswordInitMutation } from "@/hooks/auth"
import type { IAuthenticateRequest } from "@/types"
import { toast } from "sonner"
import { cn } from "@/lib"

const Login = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const navigate = useNavigate()

  const authenticateMutation = useAuthenticateMutation()
  const resetPasswordInitMutation = useResetPasswordInitMutation()

  // Zod schema for validation
  const loginSchema = z.object({
    email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
    password: z.string().min(1, "Password is required")
  })

  const forgotPasswordSchema = z.object({
    email: z.string().min(1, "Email is required").email("Please enter a valid email address")
  })

  const form = useForm({
    defaultValues: {
      email: "",
      password: ""
    },
    onSubmit: async ({ value }) => {
      try {
        // Validate form data with Zod
        const validatedData = loginSchema.parse(value)

        // Authenticate user
        const credentials: IAuthenticateRequest = {
          email: validatedData.email,
          password: validatedData.password
        }

        // Use mutate instead of mutateAsync to avoid handling the promise here
        authenticateMutation.mutate(credentials, {
          onSuccess: () => {
            // Navigate to trips page on success
            navigate({ to: "/trips" })
          },
          onError: (error) => {
            // Additional error handling if needed
            console.error("Login failed:", error)
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

  const forgotPasswordForm = useForm({
    defaultValues: {
      email: ""
    },
    onSubmit: async ({ value }) => {
      try {
        // Validate form data with Zod
        const validatedData = forgotPasswordSchema.parse(value)

        // Send reset password email
        resetPasswordInitMutation.mutate(validatedData, {
          onSuccess: () => {
            // Switch back to login form
            setShowForgotPassword(false)
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
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0E416C] shadow-lg">
              <TruckIcon className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">GL MILER</h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Fleet Management System</p>
          </div>

          <Card className="border-slate-200 bg-white/95 shadow-xl backdrop-blur-sm dark:border-slate-700 dark:bg-slate-800/95">
            <CardHeader className="text-center">
              <div className="relative overflow-hidden">
                {/* Login Title */}
                <div
                  className={cn(
                    "transform transition-all duration-500 ease-in-out",
                    showForgotPassword ? "-translate-x-full opacity-0" : "translate-x-0 opacity-100"
                  )}
                >
                  <CardTitle className="text-2xl font-bold text-blue-700 dark:text-blue-400">Welcome Back!</CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-300">
                    Please enter your credentials to sign in!
                  </CardDescription>
                </div>

                {/* Forgot Password Title */}
                <div
                  className={cn(
                    "absolute inset-0 transform transition-all duration-500 ease-in-out",
                    showForgotPassword ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
                  )}
                >
                  <CardTitle className="text-2xl font-bold text-blue-700 dark:text-blue-400">Reset Password</CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-300">
                    Enter your email to receive a password reset link
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div
                className="relative overflow-hidden"
                style={{
                  height: showForgotPassword ? "170px" : "250px",
                  transition: "height 500ms ease-in-out"
                }}
              >
                <div
                  className={cn(
                    "transform transition-all duration-500 ease-in-out",
                    showForgotPassword ? "-translate-x-full opacity-0" : "translate-x-0 opacity-100"
                  )}
                >
                  {/* Login Form */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      form.handleSubmit()
                    }}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-slate-700 dark:text-slate-300">
                        Email Address
                      </Label>
                      <div className="relative">
                        <form.Field
                          name="email"
                          children={(field) => {
                            const emailResult = loginSchema.shape.email.safeParse(field.state.value)
                            const hasError = field.state.meta.isTouched && !emailResult.success

                            return (
                              <>
                                <MailIcon
                                  className={cn("absolute top-3.5 left-3 h-4 w-4 text-slate-400 dark:text-slate-500")}
                                />
                                <Input
                                  id="email"
                                  type="email"
                                  placeholder="example@domain.com"
                                  value={field.state.value}
                                  onBlur={field.handleBlur}
                                  onChange={(e) => field.handleChange(e.target.value)}
                                  className={`h-11 pl-10 ${hasError ? "border-red-500" : ""}`}
                                  required
                                />
                                {hasError && (
                                  <div className="mt-1 text-sm text-red-500">
                                    {emailResult.success ? "" : emailResult.error.errors[0]?.message}
                                  </div>
                                )}
                              </>
                            )
                          }}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-slate-700 dark:text-slate-300">
                        Password
                      </Label>
                      <div className="relative">
                        <form.Field
                          name="password"
                          children={(field) => {
                            const passwordResult = loginSchema.shape.password.safeParse(field.state.value)
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
                                  id="password"
                                  type={showPassword ? "text" : "password"}
                                  placeholder="Enter your password"
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

                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setShowForgotPassword(true)}
                        className="text-sm text-blue-600 hover:underline dark:text-blue-400"
                      >
                        Forgot Password?
                      </button>
                    </div>

                    <Button
                      type="submit"
                      variant="default"
                      className="h-11 w-full"
                      disabled={form.state.isSubmitting || authenticateMutation.isPending}
                    >
                      {form.state.isSubmitting || authenticateMutation.isPending ? "Signing In..." : "Sign In"}
                    </Button>
                  </form>
                </div>

                <div
                  className={cn(
                    "absolute inset-0 transform transition-all duration-500 ease-in-out",
                    showForgotPassword ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
                  )}
                >
                  {/* Forgot Password Form */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      forgotPasswordForm.handleSubmit()
                    }}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="resetEmail" className="text-slate-700 dark:text-slate-300">
                        Email Address
                      </Label>
                      <div className="relative">
                        <forgotPasswordForm.Field
                          name="email"
                          children={(field) => {
                            const emailResult = forgotPasswordSchema.shape.email.safeParse(field.state.value)
                            const hasError = field.state.meta.isTouched && !emailResult.success

                            return (
                              <>
                                <MailIcon
                                  className={cn("absolute top-3.5 left-3 h-4 w-4 text-slate-400 dark:text-slate-500")}
                                />
                                <Input
                                  id="resetEmail"
                                  type="email"
                                  placeholder="Enter your email address"
                                  value={field.state.value}
                                  onBlur={field.handleBlur}
                                  onChange={(e) => field.handleChange(e.target.value)}
                                  className={`h-11 pl-10 ${hasError ? "border-red-500" : ""}`}
                                  required
                                />
                                {hasError && (
                                  <div className="mt-1 text-sm text-red-500">
                                    {emailResult.success ? "" : emailResult.error.errors[0]?.message}
                                  </div>
                                )}
                              </>
                            )
                          }}
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      variant="default"
                      className="h-11 w-full"
                      disabled={forgotPasswordForm.state.isSubmitting || resetPasswordInitMutation.isPending}
                    >
                      {forgotPasswordForm.state.isSubmitting || resetPasswordInitMutation.isPending
                        ? "Sending Reset Link..."
                        : "Send Reset Link"}
                    </Button>

                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => setShowForgotPassword(false)}
                        className="cursor-pointer text-sm text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                      >
                        Back to Login
                      </button>
                    </div>
                  </form>
                </div>
              </div>
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

export default Login
