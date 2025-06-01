export function validateEmptyFieldsByLabels<T extends Record<string, any>>(
  obj: T,
  labels: Record<string, string>
): string | null {
  const emptyFields: string[] = []

  Object.entries(labels).forEach(([key, label]) => {
    const value = obj[key as keyof T]
    const isEmpty =
      value === null ||
      value === undefined ||
      value === '' ||
      (Array.isArray(value) && value.length === 0) ||
      (typeof value === 'object' && Object.keys(value).length === 0)

    if (isEmpty) {
      emptyFields.push(label)
    }
  })

  if (emptyFields.length === 0) return null

  return `${emptyFields.join('\n- ')}`
}
