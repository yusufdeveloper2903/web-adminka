import { useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { useForm } from "@tanstack/react-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { EyeIcon, EyeOffIcon, MailIcon } from "lucide-react"
import { z } from "zod"

const Login = () => {
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  // Zod schema for validation
  const loginSchema = z.object({
    email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/\d/, "Password must contain at least one number")
      .regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character")
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
        console.log("Form submitted:", validatedData)

        // Bu yerda authentication logic bo'ladi
        // Hozircha dashboard ga yo'naltiraman
        navigate({ to: "/trips" as any })
      } catch (error) {
        if (error instanceof z.ZodError) {
          console.error("Validation errors:", error.errors)
        }
      }
    }
  })

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="mx-auto w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-blue-700">Welcome Back!</CardTitle>
          <CardDescription>Please enter your credentials to sign in!</CardDescription>
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
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <MailIcon className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
                <form.Field
                  name="email"
                  children={(field) => {
                    const emailResult = loginSchema.shape.email.safeParse(field.state.value)
                    const hasError = field.state.meta.isTouched && !emailResult.success

                    return (
                      <>
                        <Input
                          id="email"
                          type="email"
                          placeholder="example@domain.com"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          className={`pl-10 ${hasError ? "border-red-500" : ""}`}
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
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <form.Field
                  name="password"
                  children={(field) => {
                    const passwordResult = loginSchema.shape.password.safeParse(field.state.value)
                    const hasError = field.state.meta.isTouched && !passwordResult.success

                    return (
                      <>
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="4-16 characters"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          className={`pr-10 ${hasError ? "border-red-500" : ""}`}
                          required
                        />
                        {hasError && (
                          <div className="mt-1 text-sm text-red-500">
                            {passwordResult.success ? "" : passwordResult.error.errors[0]?.message}
                          </div>
                        )}
                      </>
                    )
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <a href="#" className="text-sm text-blue-600 hover:underline">
                Forgot Password?
              </a>
            </div>

            <Button type="submit" variant="default" className="w-full" disabled={form.state.isSubmitting}>
              {form.state.isSubmitting ? "Signing In..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default Login
