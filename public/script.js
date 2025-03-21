document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById('shrink-form');
    const result = document.getElementById('result');
    const shortLink = document.getElementById('shortLink');
    const longUrl = document.getElementById('longUrl');
    const copyMsg = document.getElementById('copyMsg');

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
            await navigator.clipboard.writeText(shortLink.value);
            shortLink.style.backgroundColor = 'var(--pico-border-color)';

            // Showing "Copied" message
            copyMsg.classList.add('show');
            setTimeout(() => {
                copyMsg.classList.remove('show');
            }, 3000); // Will disappear after 3 seconds

        } catch (err) {
            console.error('Failed to copy:', err);
        }
    });
    
});
