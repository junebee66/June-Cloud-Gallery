// Main application object
const App = {
    // Initialize the application
    init: function() {
        this.setupEventListeners();
        this.loadInitialContent();
    },

    // Set up event listeners for various UI interactions
    setupEventListeners: function() {
        document.querySelector('.browser-menu-button').addEventListener('click', this.toggleMenu);
        document.querySelectorAll('.collections-list a').forEach(link => {
            link.addEventListener('click', this.switchCollection);
        });
        // ... more event listeners ...
    },

    // Toggle the main menu
    toggleMenu: function() {
        document.body.classList.toggle('menu-open');
    },

    // Switch to a different collection
    switchCollection: function(event) {
        event.preventDefault();
        const collectionId = event.target.dataset.collectionId;
        const collectionTitle = event.target.dataset.title;
        
        // Update URL
        history.pushState({collectionId}, collectionTitle, event.target.href);
        
        // Load new content
        App.loadCollectionContent(collectionId);
    },

    // Load content for a specific collection
    loadCollectionContent: function(collectionId) {
        // Determine which type of content to load
        const collectionType = this.getCollectionType(collectionId);
        
        // Fetch and display the content
        this.fetchGifData(collectionType);
        
        // Update UI to reflect the new collection
        this.updateUIForCollection(collectionId);
    },

    // Determine the type of collection (e.g., 'blueprint' or 'default')
    getCollectionType: function(collectionId) {
        // Logic to determine collection type
        return collectionId === 'blueprint' ? 'blueprint' : 'default';
    },

    // Fetch GIF data based on collection type
    fetchGifData: function(collectionType) {
        const url = collectionType === 'blueprint' 
            ? 'https://junesbee.com/_functions-dev/allProjectsArchGif'
            : 'https://junesbee.com/_functions-dev/allProjectsGif';

        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data && data.items) {
                    const itemsWithGif = data.items.filter(item => item.gif);
                    this.displayGifs(itemsWithGif);
                } else {
                    console.error("No items found in the response.");
                }
            })
            .catch(error => console.error("Error fetching GIF data:", error));
    },

    // Display GIFs on the page
    displayGifs: function(items) {
        // ... code to display GIFs ...
    },

    // Update UI elements for the new collection
    updateUIForCollection: function(collectionId) {
        // ... code to update UI ...
    },

    // Load initial content when the page first loads
    loadInitialContent: function() {
        const currentCollection = document.querySelector('.fragments-container.collection.current-collection');
        const collectionId = currentCollection.dataset.collectionid;
        this.loadCollectionContent(collectionId);
    }
};

// Initialize the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    App.init();
});