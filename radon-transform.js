/**
 * Radon Transform Implementation
 * חישוב התמרת ראדון לתמונה דו-ממדית
 */

class RadonTransform {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.center = { x: width / 2, y: height / 2 };
        this.maxDistance = Math.sqrt(width * width + height * height) / 2;
    }

    /**
     * מחשב את התמרת הראדון עבור תמונה נתונה
     * @param {ImageData} imageData - נתוני התמונה
     * @param {number} numAngles - מספר הזוויות (ברירת מחדל: 180)
     * @param {number} numDistances - מספר המרחקים (ברירת מחדל: 400)
     * @returns {Array} מטריצת התמרת הראדון
     */
    transform(imageData, numAngles = 180, numDistances = 400) {
        // שינוי כיוון: זוויות בציר Y, מרחקים בציר X
        const radonData = Array(numAngles).fill().map(() => Array(numDistances).fill(0));
        const angleStep = Math.PI / numAngles;
        const distanceStep = (2 * this.maxDistance) / numDistances;
        
        for (let angleIdx = 0; angleIdx < numAngles; angleIdx++) {
            const theta = angleIdx * angleStep;
            const cosTheta = Math.cos(theta);
            const sinTheta = Math.sin(theta);
            
            for (let distIdx = 0; distIdx < numDistances; distIdx++) {
                const rho = -this.maxDistance + distIdx * distanceStep;
                let sum = 0;
                let count = 0;
                
                // סריקה לאורך הקו המוגדר על ידי theta ו-rho - צעדים גדולים יותר לביצועים
                const step = Math.max(1, Math.floor(this.maxDistance / 100));
                for (let t = -this.maxDistance; t <= this.maxDistance; t += step) {
                    const x = Math.round(this.center.x + rho * cosTheta - t * sinTheta);
                    const y = Math.round(this.center.y + rho * sinTheta + t * cosTheta);
                    
                    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
                        const pixelIndex = (y * this.width + x) * 4;
                        // בדיקת שקיפות - רק פיקסלים שאינם שקופים
                        const alpha = imageData.data[pixelIndex + 3];
                        if (alpha > 0) {
                            // ממוצע RGB משוקלל לקבלת עוצמה
                            const grayValue = (
                                imageData.data[pixelIndex] * 0.299 +     // R
                                imageData.data[pixelIndex + 1] * 0.587 + // G
                                imageData.data[pixelIndex + 2] * 0.114   // B
                            );
                            sum += grayValue * (alpha / 255);
                            count++;
                        }
                    }
                }
                
                radonData[angleIdx][distIdx] = count > 0 ? sum / Math.max(1, count) : 0;
            }
        }
        
        return radonData;
    }

    /**
     * מנרמל את נתוני התמרת הראדון לטווח 0-255
     * @param {Array} radonData - נתוני התמרת הראדון
     * @returns {Array} נתונים מנורמלים
     */
    normalize(radonData) {
        let min = Infinity;
        let max = -Infinity;
        
        // מציאת הערכים המינימליים והמקסימליים
        for (let i = 0; i < radonData.length; i++) {
            for (let j = 0; j < radonData[i].length; j++) {
                min = Math.min(min, radonData[i][j]);
                max = Math.max(max, radonData[i][j]);
            }
        }
        
        const range = max - min;
        if (range === 0) return radonData;
        
        // נירמול לטווח 0-255
        return radonData.map(row => 
            row.map(value => Math.round(((value - min) / range) * 255))
        );
    }

    /**
     * יוצר ImageData מנתוני התמרת הראדון
     * @param {Array} normalizedData - נתונים מנורמלים
     * @param {number} width - רוחב התמונה
     * @param {number} height - גובה התמונה
     * @returns {ImageData} נתוני תמונה להצגה
     */
    createImageData(normalizedData, width, height) {
        const imageData = new ImageData(width, height);
        const data = imageData.data;
        
        const dataHeight = normalizedData.length; // זוויות
        const dataWidth = normalizedData[0].length; // מרחקים
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const pixelIndex = (y * width + x) * 4;
                
                // מיפוי: Y->זוויות, X->מרחקים
                const angleIdx = Math.floor((y / height) * dataHeight);
                const distIdx = Math.floor((x / width) * dataWidth);
                
                if (angleIdx < dataHeight && distIdx < dataWidth) {
                    const value = normalizedData[angleIdx][distIdx];
                    
                    // מפת צבעים פשוטה - גווני אפור
                    data[pixelIndex] = value;     // R
                    data[pixelIndex + 1] = value; // G
                    data[pixelIndex + 2] = value; // B
                    data[pixelIndex + 3] = 255;   // A
                } else {
                    // רקע שחור
                    data[pixelIndex] = 0;
                    data[pixelIndex + 1] = 0;
                    data[pixelIndex + 2] = 0;
                    data[pixelIndex + 3] = 255;
                }
            }
        }
        
        return imageData;
    }

    /**
     * מבצע התמרת ראדון מלאה ומחזיר ImageData מוכן להצגה
     * @param {ImageData} inputImage - תמונת הקלט
     * @param {number} outputWidth - רוחב פלט
     * @param {number} outputHeight - גובה פלט
     * @param {number} numAngles - מספר זוויות
     * @param {number} numDistances - מספר מרחקים
     * @returns {ImageData} תמונת התמרת הראדון
     */
    processImage(inputImage, outputWidth = 400, outputHeight = 400, numAngles = 180, numDistances = 400) {
        const radonData = this.transform(inputImage, numAngles, numDistances);
        const normalizedData = this.normalize(radonData);
        return this.createImageData(normalizedData, outputWidth, outputHeight);
    }
}
