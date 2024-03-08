/** Language Redirection Script for Multilingual Websites
 * 
 * Purpose:
 * This script enables automatic redirection to language-specific versions of a website based 
 * on the user's browser language settings or a stored preference, enhancing user experience 
 * by delivering content in the preferred language. It is designed to execute as early as possible,
 * ideally placed in the <head> section to promptly redirect users before the page content loads.
 * 
 * SEO Considerations:
 * - The script is mindful of SEO by avoiding redirection for search engine crawlers, ensuring 
 *   multilingual content is appropriately indexed.
 * - Works in conjunction with <link rel="alternate" hreflang="x"> tags, which should be defined 
 *   before the script in the <head> section to indicate the availability of alternate language versions.
 * 
 * Implementation:
 * - Place the script after the <link rel="alternate" hreflang="x"> tags in the <head> section 
 *   of your HTML document. This ensures all SEO-related metadata is parsed before the script executes.
 * - Define the default language and adjust the script to detect the browser's language or retrieve 
 *   the user's previously selected language from session storage.
 * - The script performs an immediate redirection to the appropriate language version based on 
 *   this detection, without waiting for the full DOM to load, for a faster user experience.
 * 
 * Features:
 * - Detects browser language or retrieves the user's language preference from session storage.
 * - Ensures search engine crawlers are not redirected to maintain SEO integrity.
 * - Assumes the presence of language-specific content under respective subdirectories (e.g., /en/, /de/).
 * - Stores the user's language preference in session storage (not cookies) for privacy compliance.
 * 
 * Notes:
 * - Tailor the script to fit the specific URL structure and language strategy of your website.
 * - Regularly update the list of search engine crawlers in the script as needed.
 * - Consider user feedback on language preference and provide options for manual language selection.
 */


// Function to detect search engine crawlers based on the user agent
function isCrawler(userAgent) {
    const crawlerUserAgents = [
        'googlebot', 'bingbot', 'yandexbot', 'duckduckbot', 
        'slurp', 'baiduspider', 'sogou', 'exabot', 'facebot',
        'ia_archiver'
    ];
    return crawlerUserAgents.some(crawler => userAgent.toLowerCase().includes(crawler));
}

if (!isCrawler(navigator.userAgent)) {
    const defaultLang = 'en'; // Specify the default language
    let userLang = navigator.language || navigator.userLanguage; // Get the browser's preferred language
    userLang = userLang.split('-')[0].toLowerCase(); // Simplify the language code

    // Retrieve the stored language preference, if any
    const storedLang = sessionStorage.getItem('preferredLang');

    // Determine the target language for redirection
    const targetLang = storedLang || userLang;

    // Construct the path for redirection
    const currentPath = window.location.pathname;

    // Redirect if the user's preferred or stored language is different from the default and not already on the correct path
    if (targetLang !== defaultLang && !currentPath.startsWith(`/${targetLang}`)) {
        // Save the target language as the preferred language in session storage to avoid repeated redirections
        sessionStorage.setItem('preferredLang', targetLang);
        
        // Perform the redirection to the language-specific version of the site
        window.location.pathname = `/${targetLang}${currentPath}`;
    } else if (targetLang === defaultLang && currentPath.startsWith(`/${defaultLang}`)) {
        // If the user's preferred language is the default and they're on a non-default URL, redirect to the default path
        window.location.pathname = currentPath.replace(`/${defaultLang}`, '');
    }
}