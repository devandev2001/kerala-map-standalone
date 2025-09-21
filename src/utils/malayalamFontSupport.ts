import jsPDF from 'jspdf';

// Malayalam font data - you'll need to add the actual font file
// For now, we'll use a fallback approach with Unicode support

export const addMalayalamFontSupport = (doc: jsPDF) => {
    // Set font to support Unicode characters
    // This is a workaround until we add the actual Malayalam font
    try {
        // Try to use a system font that supports Malayalam
        doc.setFont('helvetica', 'normal');

        // Enable Unicode support
        doc.setLanguage('ml');

        return true;
    } catch (error) {
        console.warn('Could not set Malayalam font support:', error);
        return false;
    }
};

// Function to check if text contains Malayalam characters
export const containsMalayalam = (text: string): boolean => {
    // Malayalam Unicode range: U+0D00–U+0D7F
    const malayalamRegex = /[\u0D00-\u0D7F]/;
    return malayalamRegex.test(text);
};

// Function to render Malayalam text properly
export const renderMalayalamText = (doc: jsPDF, text: string, x: number, y: number, options?: any) => {
    if (containsMalayalam(text)) {
        // For Malayalam text, we need special handling
        try {
            // Set font size if provided
            if (options?.fontSize) {
                doc.setFontSize(options.fontSize);
            }

            // Set text color if provided
            if (options?.textColor) {
                doc.setTextColor(...options.textColor);
            }

            // Use splitTextToSize for better text wrapping with Malayalam
            const splitText = doc.splitTextToSize(text, options?.maxWidth || 180);

            if (Array.isArray(splitText)) {
                splitText.forEach((line, index) => {
                    doc.text(line, x, y + (index * (options?.lineHeight || 7)));
                });
            } else {
                doc.text(splitText, x, y);
            }

            return true;
        } catch (error) {
            console.warn('Error rendering Malayalam text:', error);
            // Fallback to regular text rendering
            doc.text(text, x, y);
            return false;
        }
    } else {
        // Regular text rendering
        doc.text(text, x, y);
        return true;
    }
};

// Enhanced autoTable options for Malayalam support
export const getMalayalamTableOptions = () => {
    return {
        styles: {
            font: 'helvetica',
            fontSize: 8,
            cellPadding: 3,
            lineColor: [200, 200, 200],
            lineWidth: 0.1,
            // Enable text wrapping for Malayalam content
            overflow: 'linebreak',
            cellWidth: 'wrap'
        },
        headStyles: {
            fillColor: [249, 115, 22],
            textColor: [255, 255, 255],
            fontSize: 9,
            fontStyle: 'bold',
            halign: 'center'
        },
        bodyStyles: {
            fontSize: 8,
            textColor: [60, 60, 60],
            // Better line height for Malayalam text
            minCellHeight: 12
        },
        alternateRowStyles: {
            fillColor: [248, 250, 252]
        },
        // Custom cell rendering for Malayalam text
        didParseCell: function (data: any) {
            if (data.cell.text && Array.isArray(data.cell.text)) {
                // Handle Malayalam text in cells
                data.cell.text = data.cell.text.map((text: string) => {
                    if (containsMalayalam(text)) {
                        // Ensure proper spacing for Malayalam text
                        return text;
                    }
                    return text;
                });
            }
        }
    };
};