import { useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { useForm } from "@tanstack/react-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { EyeIcon, EyeOffIcon, UserIcon, LockIcon } from "lucide-react"
import { z } from "zod"
import { useAuthenticateMutation } from "@/hooks/auth"
import type { IAuthenticateRequest } from "@/types"
import { toast } from "sonner"
import { cn } from "@/lib"

const Login = () => {
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  const authenticateMutation = useAuthenticateMutation()

  // Zod schema for validation
  const loginSchema = z.object({
    username: z.string().min(1, "Username is required"),
    password: z.string().min(1, "Password is required")
  })

  

  const form = useForm({
    defaultValues: {
      username: "",
      password: ""
    },
    onSubmit: async ({ value }) => {
      try {
        // Validate form data with Zod
        const validatedData = loginSchema.parse(value)

        // Authenticate user
        const credentials: IAuthenticateRequest = {
          username: validatedData.username,
          password: validatedData.password
        }

        // Use mutate instead of mutateAsync to avoid handling the promise here
        authenticateMutation.mutate(credentials, {
          onSuccess: (res) => {
            try {
              if (res) {
                localStorage.setItem("auth_response", JSON.stringify(res))
              }
            } catch (err) {
              console.error("Failed to persist auth response:", err)
            }
            navigate({ to: "/staffs" })
          },
          onError: (error) => {
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

  

  return (
    <div className="flex min-h-screen w-full flex-col bg-gradient-to-br from-blue-50 to-indigo-100 p-6 dark:from-slate-900 dark:to-slate-800">
      <div className="mx-auto w-full max-w-md flex-1">
        <div className="flex min-h-full flex-col justify-between">
          {/* Brand Section */}
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0E416C] shadow-lg">
              <UserIcon className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Web Adminka</h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400"> Management System</p>
          </div>

          <Card className="border-slate-200 bg-white/95 shadow-xl backdrop-blur-sm dark:border-slate-700 dark:bg-slate-800/95">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-blue-700 dark:text-blue-400">Welcome Back!</CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-300">
                Please enter your credentials to sign in!
              </CardDescription>
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
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-slate-700 dark:text-slate-300">
                    Username
                  </Label>
                  <div className="relative">
                    <form.Field
                      name="username"
                      children={(field) => {
                        const usernameResult = loginSchema.shape.username.safeParse(field.state.value)
                        const hasError = field.state.meta.isTouched && !usernameResult.success

                        return (
                          <>
                            <UserIcon
                              className={cn("absolute top-3.5 left-3 h-4 w-4 text-slate-400 dark:text-slate-500")}
                            />
                            <Input
                              id="username"
                              type="text"
                              placeholder="Enter your username"
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) => field.handleChange(e.target.value)}
                              className={`h-11 pl-10 ${hasError ? "border-red-500" : ""}`}
                              required
                            />
                            {hasError && (
                              <div className="mt-1 text-sm text-red-500">
                                {usernameResult.success ? "" : usernameResult.error.errors[0]?.message}
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

                <Button
                  type="submit"
                  variant="default"
                  className="h-11 w-full"
                  disabled={form.state.isSubmitting || authenticateMutation.isPending}
                >
                  {form.state.isSubmitting || authenticateMutation.isPending ? "Signing In..." : "Sign In"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              © {new Date().getFullYear()} Web Adminka. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
