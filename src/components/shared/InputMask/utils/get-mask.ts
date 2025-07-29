export interface InputMaskProps {
  maskType: "phone" | "date" | "time" | "creditCard" | "custom" | "driverHours"
  customMask?: string
  onChange?: (value: string) => void
  error?: string
  required?: boolean
  value?: string
}

export const getMask = (type: InputMaskProps["maskType"], customMask?: string, value?: string): string => {
  switch (type) {
    case "phone": {
      const cleanValue = value?.replace(/\s/g, "") || ""
      if (cleanValue.startsWith("+1")) {
        return "+x (xxx) xxx-xxxx"
      } else {
        return "+xxx (xx) xxx-xx-xx"
      }
    }
    case "date":
      return "99/99/9999"
    case "time":
      return "99:99"
    case "creditCard":
      return "9999 9999 9999 9999"
    case "driverHours":
      return "99hrs 99mins"
    case "custom":
      return customMask || ""
    default:
      return ""
  }
}
