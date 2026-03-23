(() => {
  const savedMode = localStorage.getItem('ap-mode');
  if (savedMode === 'dark' || savedMode === 'light') {
    document.documentElement.setAttribute('data-mode', savedMode);
  }
})();
