export const defaultHeaderOptions = {
  headerStyle: { backgroundColor: '#182c39' },
  headerTintColor: '#ff0000',
  headerTitleStyle: { color: '#faebd7' },
}

export const createHeaderOptions = (title) => ({
  title,
  ...defaultHeaderOptions,
})