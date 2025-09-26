export function getInitalsLetter(input: string): string {
  if (!input) return ""
  const initials = input
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .toUpperCase()

  return initials
}


