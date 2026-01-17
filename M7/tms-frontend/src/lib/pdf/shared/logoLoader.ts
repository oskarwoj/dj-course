import { PDF_CONFIG } from './pdfConfig'

/**
 * Loads the logo image and converts it to a data URL
 * @returns Promise resolving to data URL string or null if loading fails
 */
export async function loadLogo(): Promise<string | null> {
  try {
    const response = await fetch(PDF_CONFIG.logo.path)
    const blob = await response.blob()
    return await new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = () => resolve(null)
      reader.readAsDataURL(blob)
    })
  } catch (err) {
    console.error('Failed to load logo image', err)
    return null
  }
}
