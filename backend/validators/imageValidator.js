// helpers/imageValidator.js
const isValidImage = (url) => {
    if (typeof url !== 'string') return false;

    // Check if it's a valid URL
    try {
        new URL(url);
    } catch {
        return false;
    }

    // Check if it ends with a common image extension
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
    if (imageExtensions.some(ext => url.toLowerCase().endsWith(ext))) {
        return true;
    }

    // If no extension, check if it contains common image hosting keywords
    const imageKeywords = ['image', 'photo', 'picture', 'img'];
    return imageKeywords.some(keyword => url.toLowerCase().includes(keyword));
};

module.exports = {
    isValidImage
};
