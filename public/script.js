document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById('shrink-form');
    const result = document.getElementById('result');
    const shortLink = document.getElementById('shortLink');
    const longUrl = document.getElementById('longUrl');

    longUrl.addEventListener('click', () => {
        longUrl.select();
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        const response = await fetch('/shrink', {
            method: 'POST',
            body: new URLSearchParams(formData),
        });

        if (response.ok) {
            const shortUrl = await response.text();
            shortLink.value = shortUrl;
            result.style.display = 'block';
            shortLink.style.backgroundColor = 'var(--pico-background-color)';
        
        } else {
            console.error('Failed to shrink the URL.');
        }
    });

    shortLink.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(shortLink.textContent);
            shortLink.style.backgroundColor = 'var(--pico-border-color)';

        } catch (err) {
            console.error('Failed to copy:', err);
        }
    });
    
});