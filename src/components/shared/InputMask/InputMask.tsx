import React, { useEffect, useState } from "react"
import { InputMask as ReactInputMask } from "@react-input/mask"

import { getMask, type InputMaskProps } from "./utils/get-mask"
import { Input } from "@/components/ui"

const InputMask = ({
  maskType,
  customMask,
  onChange,
  error,
  required,
  value: propValue = "",
  ...props
}: InputMaskProps) => {
  const [value, setValue] = useState(propValue)

  useEffect(() => {
    setValue(propValue)
  }, [propValue])

  const mask = getMask(maskType, customMask, value)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value
    let finalValue = rawValue

    if (maskType === "phone") {
      const newDigits = rawValue.replace(/\D/g, "")
      const oldDigits = value.replace(/\D/g, "")

      // Handle setting the prefix on the very first digit
      if (oldDigits.length === 0 && newDigits.length === 1) {
        if (newDigits === "1") {
          finalValue = "+1 "
        } else if (newDigits === "9") {
          finalValue = "+998 "
        } else {
          finalValue = `+${newDigits}`
        }
      }
      // Handle deletion back to an empty state
      else if (newDigits.length === 0) {
        finalValue = ""
      } else if (value === "+1 " && newDigits.startsWith("1")) {
        const userInput = newDigits.substring(1) // Get digits after the '1'
        finalValue = `+1 (${userInput}`
      } else if (value === "+998 " && newDigits.startsWith("998")) {
        const userInput = newDigits.substring(3) // Get digits after '998'
        finalValue = `+998 (${userInput}`
      }
    }

    setValue(finalValue)
    onChange?.(finalValue)
  }

  return (
    <ReactInputMask
      {...props}
      component={Input}
      placeholder="Enter phone number"
      mask={mask}
      replacement={{ x: /[0-9]/ }}
      type="text"
      value={value}
      onChange={handleChange}
      onError={error as any}
      required={required}
    />
  )
}

export default InputMask
