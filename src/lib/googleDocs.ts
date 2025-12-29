/**
 * Google Docs API Client
 *
 * This module provides utilities for fetching and converting Google Docs content.
 * It uses a service account to access shared documents without user authentication.
 *
 * Setup Instructions:
 * 1. Create a Google Cloud project
 * 2. Enable Google Docs API
 * 3. Create a service account and download credentials
 * 4. Share target Google Docs with the service account email
 * 5. Add credentials to .env file:
 *    - GOOGLE_SERVICE_ACCOUNT_EMAIL
 *    - GOOGLE_PRIVATE_KEY
 *
 * Use Cases:
 * - Display student roadmaps from Google Docs
 * - Show curriculum content managed by instructors
 * - Render read-only documentation
 *
 * @module lib/googleDocs
 * @see https://developers.google.com/docs/api
 */

import { google } from 'googleapis';

/**
 * Initialize Google Docs API Client
 *
 * Creates an authenticated Google Docs API client using service account credentials.
 * The service account allows server-side access to shared Google Docs without
 * requiring user authentication.
 *
 * Environment Variables Required:
 * - GOOGLE_SERVICE_ACCOUNT_EMAIL: Service account email (e.g., account@project.iam.gserviceaccount.com)
 * - GOOGLE_PRIVATE_KEY: Service account private key (must include \n for line breaks)
 *
 * Permissions:
 * - Scope: documents.readonly (can only read documents, not modify)
 * - Documents must be shared with the service account email
 *
 * @returns {google.docs_v1.Docs} Authenticated Google Docs API client
 *
 * @throws {Error} If environment variables are missing or invalid
 *
 * @example
 * ```typescript
 * const docs = getGoogleDocsClient();
 * const response = await docs.documents.get({ documentId: 'abc123' });
 * ```
 */
export function getGoogleDocsClient() {
  // Service account credentials from environment variables
  const credentials = {
    type: 'service_account',
    project_id: 'toku-web-doc-storage', // Google Cloud project ID
    // Replace escaped newlines with actual newlines in private key
    // This is necessary because .env files escape special characters
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  };

  // Create Google Auth client with service account credentials
  const auth = new google.auth.GoogleAuth({
    credentials,
    // Read-only scope - ensures we can't accidentally modify documents
    scopes: ['https://www.googleapis.com/auth/documents.readonly'],
  });

  // Return authenticated Docs API client (v1)
  return google.docs({ version: 'v1', auth });
}

/**
 * Fetch Google Document Content
 *
 * Retrieves the full content and structure of a Google Doc by its document ID.
 * The document must be shared with the service account email for this to work.
 *
 * Document ID Location:
 * - Found in the Google Docs URL
 * - Format: https://docs.google.com/document/d/DOCUMENT_ID/edit
 * - Example: https://docs.google.com/document/d/1AkKlxCz5F2ZihNYQuQ9XP-TAVBWP84h5Hh9flVJ4a8I/edit
 *   Document ID = 1AkKlxCz5F2ZihNYQuQ9XP-TAVBWP84h5Hh9flVJ4a8I
 *
 * Sharing Requirements:
 * - Document must be shared with the service account email
 * - Minimum permission: Viewer
 * - Share via: Share button > Add people > Paste service account email
 *
 * @async
 * @param {string} documentId - The Google Docs document ID
 * @returns {Promise<docs_v1.Schema$Document>} The document data including title, content, and structure
 *
 * @throws {Error} If document is not found, not shared, or API error occurs
 *
 * @example
 * ```typescript
 * const doc = await getGoogleDoc('1AkKlxCz5F2ZihNYQuQ9XP-TAVBWP84h5Hh9flVJ4a8I');
 * console.log(doc.title); // "Student Roadmap"
 * console.log(doc.body.content); // Array of document elements
 * ```
 */
export async function getGoogleDoc(documentId: string) {
  try {
    // Get authenticated Google Docs client
    const docs = getGoogleDocsClient();

    // Fetch the document by ID
    const response = await docs.documents.get({
      documentId,
    });

    // Return the document data (includes title, body, styles, etc.)
    return response.data;
  } catch (error) {
    console.error('Error fetching Google Doc:', error);
    // Re-throw to be handled by the calling function
    throw error;
  }
}

/**
 * Convert Google Doc to HTML
 *
 * Transforms the structured Google Docs API response into styled HTML.
 * This is a simplified converter that handles common formatting elements.
 *
 * Supported Features:
 * - Headings (H1-H4)
 * - Paragraphs
 * - Text styling (bold, italic, underline)
 * - Hyperlinks
 * - Lists (ordered/unordered with bullets)
 * - Tables
 * - Line breaks
 *
 * Not Supported (would require additional implementation):
 * - Images
 * - Text color/background
 * - Advanced table formatting
 * - Nested lists (flattens all to single level)
 * - Footnotes
 * - Headers/footers
 *
 * Styling:
 * - Uses Tailwind CSS classes for responsive, dark-mode compatible styling
 * - Links open in new tabs with security attributes (noopener noreferrer)
 *
 * @param {any} doc - The Google Docs API document object
 * @returns {string} HTML string with Tailwind CSS classes
 *
 * @example
 * ```typescript
 * const doc = await getGoogleDoc('abc123');
 * const html = convertGoogleDocToHTML(doc);
 * // html = '<h1 class="...">Title</h1><p class="...">Content</p>'
 * ```
 */
export function convertGoogleDocToHTML(doc: any): string {
  // Handle empty or invalid documents
  if (!doc.body?.content) {
    return '<p>No content available</p>';
  }

  let html = '';
  let inList = false;
  let listType: 'ul' | 'ol' | null = null;

  // Iterate through document elements (paragraphs, tables, etc.)
  for (let i = 0; i < doc.body.content.length; i++) {
    const element = doc.body.content[i];
    // HANDLE PARAGRAPHS (most common element type)
    if (element.paragraph) {
      const paragraph = element.paragraph;
      let paragraphHTML = '';

      // Process each text run within the paragraph
      // A paragraph can contain multiple text runs with different styles
      if (paragraph.elements) {
        for (const elem of paragraph.elements) {
          if (elem.textRun) {
            let text = elem.textRun.content;
            const textStyle = elem.textRun.textStyle || {};

            // Remove checkbox characters and other special symbols
            // Common checkbox/bullet Unicode characters from Google Docs
            // Expanded to include more bullet/checkbox variants and box-drawing characters
            text = text.replace(/[\u2610-\u2612\u2713-\u2718\u25A0-\u25FF\u2022\u2023\u2043\u204C\u204D\u2219\u2500-\u257F\u2B58]/g, '');

            // Also remove any replacement character symbols (�)
            text = text.replace(/\uFFFD/g, '');

            let styledText = text;

            // Apply inline text formatting (order matters for proper nesting)
            // Bold: Wrap in <strong> tags
            if (textStyle.bold) {
              styledText = `<strong>${styledText}</strong>`;
            }
            // Italic: Wrap in <em> tags
            if (textStyle.italic) {
              styledText = `<em>${styledText}</em>`;
            }
            // Underline: Wrap in <u> tags
            if (textStyle.underline) {
              styledText = `<u>${styledText}</u>`;
            }
            // Hyperlinks: Wrap in <a> tags with security attributes
            if (textStyle.link?.url) {
              // target="_blank" - opens in new tab
              // rel="noopener noreferrer" - security best practice for external links
              styledText = `<a href="${textStyle.link.url}" target="_blank" rel="noopener noreferrer" class="text-blue-600 dark:text-blue-400 hover:underline">${styledText}</a>`;
            }

            paragraphHTML += styledText;
          }
        }
      }

      // Determine paragraph type based on Google Docs style
      const paragraphStyle = paragraph.paragraphStyle;
      const namedStyleType = paragraphStyle?.namedStyleType;
      const bullet = paragraph.bullet;

      // Check if this is a list item
      const isListItem = !!bullet;
      const nextElement = doc.body.content[i + 1];
      const nextIsListItem = nextElement?.paragraph?.bullet;

      // Handle list items
      if (isListItem) {
        // Determine list type from the lists object in the document
        const listId = bullet.listId;
        const list = doc.lists?.[listId];
        const nestingLevel = bullet.nestingLevel || 0;
        const listProperties = list?.listProperties?.nestingLevels?.[nestingLevel];
        const glyphType = listProperties?.glyphType;

        // Determine if ordered or unordered based on glyph type
        const currentListType = glyphType?.includes('DECIMAL') || glyphType?.includes('ROMAN') || glyphType?.includes('ALPHA')
          ? 'ol'
          : 'ul';

        // Open list if starting a new list
        if (!inList) {
          listType = currentListType;
          html += `<${listType} class="list-disc list-inside ml-4 mb-4 space-y-1 text-gray-700 dark:text-gray-300">`;
          inList = true;
        }

        // Add list item (trim any remaining special chars at start)
        const cleanedParagraph = paragraphHTML.replace(/^[\s\u2610-\u2612\u2713-\u2718\u25A0-\u25FF\u2022\u2023\u2043\u204C\u204D\u2219\u2500-\u257F\u2B58\uFFFD]+/, '').trim();
        html += `<li class="leading-relaxed">${cleanedParagraph}</li>`;

        // Close list if this is the last list item
        if (!nextIsListItem) {
          html += `</${listType}>`;
          inList = false;
          listType = null;
        }
      }
      // Handle headings
      else if (namedStyleType === 'HEADING_1') {
        // Close any open list before heading
        if (inList) {
          html += `</${listType}>`;
          inList = false;
          listType = null;
        }
        // Main title/heading
        html += `<h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-4 mt-8">${paragraphHTML}</h1>`;
      } else if (namedStyleType === 'HEADING_2') {
        if (inList) {
          html += `</${listType}>`;
          inList = false;
          listType = null;
        }
        // Section heading
        html += `<h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-3 mt-6">${paragraphHTML}</h2>`;
      } else if (namedStyleType === 'HEADING_3') {
        if (inList) {
          html += `</${listType}>`;
          inList = false;
          listType = null;
        }
        // Subsection heading
        html += `<h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2 mt-4">${paragraphHTML}</h3>`;
      } else if (namedStyleType === 'HEADING_4') {
        if (inList) {
          html += `</${listType}>`;
          inList = false;
          listType = null;
        }
        // Minor heading
        html += `<h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-2 mt-3">${paragraphHTML}</h4>`;
      } else {
        if (inList) {
          html += `</${listType}>`;
          inList = false;
          listType = null;
        }
        // Regular paragraph (NORMAL_TEXT or default)
        if (paragraphHTML.trim()) {
          html += `<p class="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">${paragraphHTML}</p>`;
        } else {
          // Empty paragraph - render as line break
          html += '<br />';
        }
      }
    }
    // HANDLE TABLES
    else if (element.table) {
      // Close any open list before table
      if (inList) {
        html += `</${listType}>`;
        inList = false;
        listType = null;
      }

      // Start table with Tailwind styling
      html += '<table class="min-w-full border border-gray-300 dark:border-gray-700 mb-4"><tbody>';

      // Iterate through table rows
      for (const row of element.table.tableRows) {
        html += '<tr>';

        // Iterate through cells in the row
        for (const cell of row.tableCells) {
          let cellContent = '';

          // Extract text content from cell
          // Cells can contain multiple paragraphs
          if (cell.content) {
            for (const cellElement of cell.content) {
              if (cellElement.paragraph?.elements) {
                for (const elem of cellElement.paragraph.elements) {
                  if (elem.textRun) {
                    // Note: This simplified version doesn't apply text styling in tables
                    // Could be extended to support bold, italic, etc. in table cells
                    cellContent += elem.textRun.content;
                  }
                }
              }
            }
          }

          // Add table cell with styling
          html += `<td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-gray-700 dark:text-gray-300">${cellContent}</td>`;
        }
        html += '</tr>';
      }

      html += '</tbody></table>';
    }
    // Other element types (images, page breaks, etc.) are not currently handled
    // They will be silently skipped
  }

  // Close any open list at the end of the document
  if (inList && listType) {
    html += `</${listType}>`;
  }

  return html;
}
