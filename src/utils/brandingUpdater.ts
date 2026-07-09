/**
 * Branding Updater Utility
 * Dynamically updates website title and favicon based on theme settings
 */

import { ThemeSettings } from '../types';

/**
 * Updates the browser page title
 */
export function updatePageTitle(title: string): void {
  document.title = title;
}

/**
 * Updates the favicon dynamically
 */
export function updateFavicon(iconUrl: string): void {
  // Remove existing favicon link if present
  let faviconLink = document.querySelector("link[rel='icon']") as HTMLLinkElement;
  
  if (!faviconLink) {
    // Create new favicon link if it doesn't exist
    faviconLink = document.createElement('link');
    faviconLink.rel = 'icon';
    document.head.appendChild(faviconLink);
  }
  
  // Update the href to the new favicon URL
  faviconLink.href = iconUrl;
}

/**
 * Updates both page title and favicon from theme settings
 */
export function updateBranding(themeSettings: ThemeSettings): void {
  updatePageTitle(themeSettings.websiteTitle);
  updateFavicon(themeSettings.faviconUrl);
}

/**
 * Initializes branding on app load
 */
export function initializeBranding(themeSettings: ThemeSettings): void {
  updateBranding(themeSettings);
  
  // Set up meta tags for OG (Open Graph) if available
  const metaOgTitle = document.querySelector("meta[property='og:title']") as HTMLMetaElement;
  if (metaOgTitle) {
    metaOgTitle.content = themeSettings.websiteTitle;
  }
}
