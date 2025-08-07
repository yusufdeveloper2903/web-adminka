// Format number with space as thousands separator (36083.5 -> "36 083.5")
export const formatThousands = (value: number | null | undefined): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return "0"
  }

  // Use en-US locale but replace comma with space
  const formatted = value.toLocaleString("en-US")

  // Replace comma with space for thousands separator
  return formatted.replace(/,/g, " ")
}
