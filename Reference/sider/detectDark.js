if (
  localStorage.getItem('theme') === 'dark' ||
  (localStorage.getItem('theme') === 'auto' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches)
) {
  document.documentElement.style.colorScheme = 'dark'
  document.documentElement.setAttribute('data-gpts-theme', 'dark')
}
