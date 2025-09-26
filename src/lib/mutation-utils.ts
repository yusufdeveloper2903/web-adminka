import { toast } from "sonner"
import { getErrorMessage, getStatusErrorMessage } from "./error-utils"

// Common error messages for different entity types
export const ERROR_MESSAGES = {
  INVALID_DATA: "Invalid data. Please check your input and try again.",
  NOT_FOUND: "Item not found.",
  ALREADY_EXISTS: "Item with this information already exists.",
  SERVER_ERROR: "Server error. Please try again later.",
  INVALID_STATUS_CHANGE: "Invalid status change request."
} as const

// Entity-specific error messages
export const ENTITY_ERROR_MESSAGES = {
  trip: {
    INVALID_DATA: "Invalid trip data. Please check your input and try again.",
    NOT_FOUND: "Trip not found.",
    ALREADY_EXISTS: "Trip with this load number already exists.",
    CREATE_SUCCESS: "Trip created successfully!",
    UPDATE_SUCCESS: "Trip updated successfully!",
    STATUS_SUCCESS: (active: boolean) => `Trip ${active ? "activated" : "canceled"} successfully!`,
  },
  truck: {
    INVALID_DATA: "Invalid truck data. Please check your input and try again.",
    NOT_FOUND: "Truck not found.",
    ALREADY_EXISTS: "Truck with this VIN or unit number already exists.",
    CREATE_SUCCESS: "Truck created successfully!",
    UPDATE_SUCCESS: "Truck updated successfully!",
    STATUS_SUCCESS: (active: boolean) => `Truck ${active ? "activated" : "deactivated"} successfully!`
  },
  dispatcher: {
    INVALID_DATA: "Invalid dispatcher data. Please check your input and try again.",
    NOT_FOUND: "Dispatcher not found.",
    ALREADY_EXISTS: "Dispatcher with this name already exists.",
    CREATE_SUCCESS: "Dispatcher created successfully!",
    UPDATE_SUCCESS: "Dispatcher updated successfully!",
    STATUS_SUCCESS: (active: boolean) => `Dispatcher ${active ? "activated" : "deactivated"} successfully!`
  },
  team: {
    INVALID_DATA: "Invalid team data. Please check your input and try again.",
    NOT_FOUND: "Team not found.",
    ALREADY_EXISTS: "Team with this name already exists.",
    CREATE_SUCCESS: "Team created successfully!",
    UPDATE_SUCCESS: "Team updated successfully!",
    STATUS_SUCCESS: (active: boolean) => `Team ${active ? "activated" : "deactivated"} successfully!`
  },
  shop: {
    INVALID_DATA: "Invalid shop data. Please check your input and try again.",
    NOT_FOUND: "Shop not found.",
    ALREADY_EXISTS: "Shop with this name and location already exists.",
    CREATE_SUCCESS: "Shop created successfully!",
    UPDATE_SUCCESS: "Shop updated successfully!",
    STATUS_SUCCESS: (active: boolean) => `Shop ${active ? "activated" : "deactivated"} successfully!`
  },
  company: {
    INVALID_DATA: "Invalid company data. Please check your input and try again.",
    NOT_FOUND: "Company not found.",
    ALREADY_EXISTS: "Company with this name already exists.",
    CREATE_SUCCESS: "Company created successfully!",
    UPDATE_SUCCESS: "Company updated successfully!",
    STATUS_SUCCESS: (active: boolean) => `Company ${active ? "activated" : "deactivated"} successfully!`
  },
  user: {
    INVALID_DATA: "Invalid user data. Please check your input and try again.",
    NOT_FOUND: "User not found.",
    ALREADY_EXISTS: "User with this name already exists.",
    CREATE_SUCCESS: "User created successfully!",
    UPDATE_SUCCESS: "User updated successfully!",
    STATUS_SUCCESS: (active: boolean) => `User ${active ? "activated" : "deactivated"} successfully!`
  },
  drivers: {
    INVALID_DATA: "Invalid drivers data.",
    NOT_FOUND: "Driver(s) not found.",
    ALREADY_EXISTS: "Already assigned.",
    CREATE_SUCCESS: "Created successfully!",
    UPDATE_SUCCESS: "Assigned successfully!",
    STATUS_SUCCESS: (active: boolean) => `Drivers ${active ? "activated" : "deactivated"} successfully!`
  },
  globalSetting: {
    INVALID_DATA: "Invalid global setting data. Please check your input and try again.",
    NOT_FOUND: "Global setting not found.",
    ALREADY_EXISTS: "Global setting with this name already exists.",
    CREATE_SUCCESS: "Global setting created successfully!",
    UPDATE_SUCCESS: "Global setting updated successfully!",
    STATUS_SUCCESS: (active: boolean) => `Global setting ${active ? "activated" : "deactivated"} successfully!`
  },
  userRouteSetting: {
    INVALID_DATA: "Invalid user route setting data. Please check your input and try again.",
    NOT_FOUND: "User route setting not found.",
    ALREADY_EXISTS: "User route setting with this name already exists.",
    CREATE_SUCCESS: "User route setting created successfully!",
    UPDATE_SUCCESS: "User route setting updated successfully!",
    STATUS_SUCCESS: (active: boolean) => `User route setting ${active ? "activated" : "deactivated"} successfully!`
  },
  changeCompanyTokens: {
    INVALID_DATA: "Invalid tokens data. Please check your input and try again.",
    NOT_FOUND: "Tokens not found.",
    ALREADY_EXISTS: "Tokens with this name already exists.",
    CREATE_SUCCESS: "Tokens created successfully!",
    UPDATE_SUCCESS: "Tokens updated successfully!",
    STATUS_SUCCESS: (active: boolean) => `Tokens ${active ? "activated" : "deactivated"} successfully!`
  }
} as const

// Generic error handler for mutations
export const handleMutationError = (
  error: any,
  entityType: keyof typeof ENTITY_ERROR_MESSAGES,
  operation: "create" | "update" | "status" = "create"
) => {
  console.error(`${operation} ${entityType} failed:`, error)

  // Prioritize server error message, then fallback to generic messages
  let errorMessage = error?.response?.data?.message || getErrorMessage(error)

  // Provide more specific messages based on status
  if (error?.response?.status) {
    const status = error.response.status
    const entityMessages = ENTITY_ERROR_MESSAGES[entityType]

    if (status === 400) {
      errorMessage = error?.response?.data?.message || entityMessages.INVALID_DATA
    } else if (status === 404) {
      errorMessage = error?.response?.data?.message || entityMessages.NOT_FOUND
    } else if (status === 409) {
      errorMessage = error?.response?.data?.message || entityMessages.ALREADY_EXISTS
    } else if (status === 500) {
      errorMessage = error?.response?.data?.message || ERROR_MESSAGES.SERVER_ERROR
    } else {
      errorMessage = error?.response?.data?.message || getStatusErrorMessage(status)
    }
  }

  // Show error toast
  toast.error(errorMessage)
}

// Generic success handler for mutations
export const handleMutationSuccess = (
  entityType: keyof typeof ENTITY_ERROR_MESSAGES,
  operation: "create" | "update" | "status",
  data?: { active?: boolean }
) => {
  const entityMessages = ENTITY_ERROR_MESSAGES[entityType]

  let successMessage: string

  switch (operation) {
    case "create":
      successMessage = entityMessages.CREATE_SUCCESS
      break
    case "update":
      successMessage = entityMessages.UPDATE_SUCCESS
      break
    case "status":
      successMessage = entityMessages.STATUS_SUCCESS(data?.active ?? true)
      break
    default:
      successMessage = "Operation completed successfully!"
  }

  toast.success(successMessage)
}

// Generic mutation configuration helper
export const createMutationConfig = <TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  entityType: keyof typeof ENTITY_ERROR_MESSAGES,
  operation: "create" | "update" | "status",
  onSuccessCallback?: (data: TData, variables: TVariables) => void,
  options?: { statusDefaultActive?: boolean }
) => {
  return {
    mutationFn,
    onSuccess: (data: TData, variables: TVariables) => {
      // Handle success message
      if (operation === "status") {
        const defaultActive = options?.statusDefaultActive ?? true
        const payload: any = {
          ...(data as any),
          active: (data as any)?.active ?? defaultActive
        }
        handleMutationSuccess(entityType, operation, payload)
      } else {
        handleMutationSuccess(entityType, operation, data as any)
      }

      // Call custom success callback if provided
      if (onSuccessCallback) {
        onSuccessCallback(data, variables)
      }
    },
    onError: (error: any) => {
      handleMutationError(error, entityType, operation)
    }
  }
}
