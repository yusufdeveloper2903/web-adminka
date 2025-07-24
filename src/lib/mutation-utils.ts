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
    STATUS_SUCCESS: (active: boolean) => `Trip ${active ? "activated" : "deactivated"} successfully!`
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
  onSuccessCallback?: (data: TData, variables: TVariables) => void
) => {
  return {
    mutationFn,
    onSuccess: (data: TData, variables: TVariables) => {
      // Handle success message
      handleMutationSuccess(entityType, operation, data as any)

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
