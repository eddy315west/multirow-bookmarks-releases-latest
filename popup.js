// Cross-browser compatibility
const bookmarksAPI = typeof browser !== 'undefined' ? browser.bookmarks : chrome.bookmarks;

bookmarksAPI.getTree(tree => {
  const container = document.getElementById('bookmarks');
  
  try {
    const root = tree[0];
    if (!root || !root.children) {
      container.textContent = 'No bookmarks found.';
      return;
    }
    
    // Find bookmarks toolbar
    const bar = root.children.find(n => 
      n.title === 'Bookmarks bar' || 
      n.title === 'Bookmarks Toolbar' ||
      n.title === 'Favorites bar'
    );
    
    if (!bar || !bar.children || bar.children.length === 0) {
      container.textContent = 'No bookmarks in toolbar.';
      container.style.textAlign = 'center';
      container.style.padding = '20px';
      return;
    }
    
    // Filter only bookmarks with URLs (not folders)
    const bookmarks = bar.children.filter(b => b.url);
    
    if (bookmarks.length === 0) {
      container.textContent = 'No URL bookmarks in toolbar.';
      container.style.textAlign = 'center';
      container.style.padding = '20px';
      return;
    }
    
    // Clear any loading text
    container.textContent = '';
    
    // Display all bookmarks
    bookmarks.forEach(b => {
      const a = document.createElement('a');
      a.href = b.url;
      
      // Use title or extract domain from URL
      let displayText = b.title;
      if (!displayText || displayText.trim() === '') {
        try {
          const url = new URL(b.url);
          displayText = url.hostname.replace('www.', '');
          // Remove common TLDs for cleaner display
          displayText = displayText.replace(/\.(com|org|net|edu|gov)$/i, '');
        } catch {
          displayText = b.url.length > 20 ? b.url.substring(0, 17) + '...' : b.url;
        }
      }
      
      // Truncate long names
      if (displayText.length > 15) {
        displayText = displayText.substring(0, 14) + '…';
      }
      
      a.textContent = displayText;
      a.title = `${b.title || 'No title'}\n${b.url}`;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      
      // Close popup when clicked
      a.addEventListener('click', (e) => {
        if (!e.ctrlKey && !e.metaKey) {
          setTimeout(() => window.close(), 100);
        }
      });
      
      container.appendChild(a);
    });
    
  } catch (error) {
    console.error('Error loading bookmarks:', error);
    container.textContent = 'Error loading bookmarks.';
    container.style.color = '#f00';
    container.style.textAlign = 'center';
    container.style.padding = '20px';
  }
});

// Refresh if bookmarks change while popup is open
if (bookmarksAPI.onCreated) {
  bookmarksAPI.onCreated.addListener(() => {
    location.reload();
  });
}