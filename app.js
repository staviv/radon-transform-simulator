/**
 * Radon Transform Simulator - Main Application
 * סימולציית התמרת ראדון אינטראקטיבית
 */

class Shape {
    constructor(type, x, y, size, rotation = 0, intensity = 1, width = null, height = null) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.size = size;
        this.width = width || size;
        this.height = height || size;
        this.rotation = rotation;
        this.intensity = intensity;
        this.id = Math.random().toString(36).substr(2, 9);
        this.selected = false;
        this.isCreating = false; // עבור יצירה עם גרירה
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation * Math.PI / 180);
        
        const alpha = this.intensity;
        ctx.globalAlpha = alpha;
        
        if (this.selected) {
            ctx.strokeStyle = '#5a67d8';
            ctx.lineWidth = 3;
        } else {
            ctx.strokeStyle = '#2d3748';
            ctx.lineWidth = 1;
        }
        
        // צבע הצורה
        ctx.fillStyle = `rgba(45, 55, 72, ${alpha})`;
        ctx.globalCompositeOperation = 'source-over';
        
        switch (this.type) {
            case 'ellipse':
                this.drawEllipse(ctx);
                break;
            case 'rectangle':
                this.drawRectangle(ctx);
                break;
            case 'triangle':
                this.drawTriangle(ctx);
                break;
            case 'star':
                this.drawStar(ctx);
                break;
        }
        
        ctx.restore();
    }

    drawCircle(ctx) {
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
    }

    drawRectangle(ctx) {
        const halfWidth = this.width / 2;
        const halfHeight = this.height / 2;
        ctx.beginPath();
        ctx.rect(-halfWidth, -halfHeight, this.width, this.height);
        ctx.fill();
        ctx.stroke();
    }

    drawTriangle(ctx) {
        const size = this.size;
        ctx.beginPath();
        ctx.moveTo(0, -size);
        ctx.lineTo(-size * 0.866, size * 0.5);
        ctx.lineTo(size * 0.866, size * 0.5);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }

    drawEllipse(ctx) {
        ctx.beginPath();
        ctx.ellipse(0, 0, this.width / 2, this.height / 2, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
    }

    drawStar(ctx) {
        const size = this.size;
        const spikes = 5;
        const outerRadius = size;
        const innerRadius = size * 0.4;
        
        ctx.beginPath();
        for (let i = 0; i < spikes * 2; i++) {
            const angle = (i * Math.PI) / spikes;
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const x = Math.cos(angle - Math.PI / 2) * radius;
            const y = Math.sin(angle - Math.PI / 2) * radius;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }

    contains(x, y) {
        const dx = x - this.x;
        const dy = y - this.y;
        
        // סיבוב בחזרה כדי לבדוק בקואורדינטות המקומיות
        const cos = Math.cos(-this.rotation * Math.PI / 180);
        const sin = Math.sin(-this.rotation * Math.PI / 180);
        const localX = dx * cos - dy * sin;
        const localY = dx * sin + dy * cos;
        
        switch (this.type) {
            case 'ellipse':
                return ((localX * localX) / ((this.width / 2) * (this.width / 2)) + 
                        (localY * localY) / ((this.height / 2) * (this.height / 2))) <= 1;
                
            case 'rectangle':
                return Math.abs(localX) <= this.width / 2 && Math.abs(localY) <= this.height / 2;
                
            case 'triangle':
            case 'star':
                return Math.sqrt(localX * localX + localY * localY) <= this.size * 1.2;
                
            default:
                return false;
        }
    }
}

class DrawPath {
    constructor(points, intensity = 1) {
        this.type = 'draw';
        this.points = points || [];
        this.intensity = intensity;
        this.id = Math.random().toString(36).substr(2, 9);
        this.selected = false;
        this.boundingBox = this.calculateBoundingBox();
    }

    calculateBoundingBox() {
        if (this.points.length === 0) {
            return { x: 0, y: 0, width: 0, height: 0 };
        }
        
        const xs = this.points.map(p => p.x);
        const ys = this.points.map(p => p.y);
        const minX = Math.min(...xs);
        const maxX = Math.max(...xs);
        const minY = Math.min(...ys);
        const maxY = Math.max(...ys);
        
        return {
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY
        };
    }

    draw(ctx) {
        if (this.points.length < 2) return;
        
        ctx.save();
        ctx.globalAlpha = this.intensity;
        ctx.strokeStyle = this.selected ? '#5a67d8' : '#2d3748';
        ctx.lineWidth = this.selected ? 4 : 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        ctx.beginPath();
        ctx.moveTo(this.points[0].x, this.points[0].y);
        
        for (let i = 1; i < this.points.length; i++) {
            ctx.lineTo(this.points[i].x, this.points[i].y);
        }
        
        ctx.stroke();
        ctx.restore();
    }

    contains(x, y) {
        const tolerance = 10;
        for (let i = 0; i < this.points.length - 1; i++) {
            const p1 = this.points[i];
            const p2 = this.points[i + 1];
            
            // בדיקת מרחק מקו
            const distance = this.distanceToLineSegment(x, y, p1.x, p1.y, p2.x, p2.y);
            if (distance <= tolerance) {
                return true;
            }
        }
        return false;
    }

    distanceToLineSegment(px, py, x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const length = Math.sqrt(dx * dx + dy * dy);
        
        if (length === 0) {
            return Math.sqrt((px - x1) * (px - x1) + (py - y1) * (py - y1));
        }
        
        const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (length * length)));
        const projX = x1 + t * dx;
        const projY = y1 + t * dy;
        
        return Math.sqrt((px - projX) * (px - projX) + (py - projY) * (py - projY));
    }
}

class RadonSimulator {
    constructor() {
        this.originalCanvas = document.getElementById('original-canvas');
        this.radonCanvas = document.getElementById('radon-canvas');
        this.originalCtx = this.originalCanvas.getContext('2d');
        this.radonCtx = this.radonCanvas.getContext('2d');
        
        this.radonTransform = new RadonTransform(
            this.originalCanvas.width,
            this.originalCanvas.height
        );
        
        this.shapes = [];
        this.selectedShape = null;
        this.currentShapeType = 'ellipse';
        this.isDragging = false;
        this.dragStart = { x: 0, y: 0 };
        this.isRotating = false;
        this.isCreating = false; // עבור יצירת צורות עם גרירה
        this.showGrid = true; // הצגת רשת
        this.isSelecting = false; // מצב בחירת אזור
        this.selectionStart = null;
        this.selectionEnd = null;
        this.resolution = 'medium';
        this.lastUpdateTime = 0;
        this.frameCount = 0;
        this.fps = 0;
        this.history = [];
        this.historyIndex = -1;
        this.updateTimeout = null;
        this.isUpdating = false;
        this.autoUpdate = true;
        this.isDrawing = false;
        this.drawPath = [];
        
        this.initializeEventListeners();
        this.saveState();
        this.updateUI();
        this.updateRadonTransform();
    }

    initializeEventListeners() {
        // Shape selection buttons
        document.querySelectorAll('.shape-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.shape-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentShapeType = e.target.dataset.shape;
                this.selectedShape = null;
                this.updateCanvasCursor();
                this.redrawOriginal();
            });
        });

        // Auto update checkbox
        document.getElementById('auto-update').addEventListener('change', (e) => {
            this.autoUpdate = e.target.checked;
            if (this.autoUpdate) {
                this.updateRadonTransformImmediate();
            }
        });

        // Grid display checkbox
        document.getElementById('show-grid').addEventListener('change', (e) => {
            this.showGrid = e.target.checked;
            this.redrawOriginal();
        });

        // Shape type change for selected shape
        document.getElementById('shape-type-select').addEventListener('change', (e) => {
            if (this.selectedShape && this.selectedShape.type !== 'draw' && e.target.value) {
                this.selectedShape.type = e.target.value;
                this.saveState();
                this.redrawOriginal();
                if (this.autoUpdate) {
                    this.scheduleRadonUpdate();
                }
            }
            e.target.value = ''; // Reset selection
        });

        // Canvas mouse events
        this.originalCanvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.originalCanvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.originalCanvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        
        // Control sliders
        const sizeSlider = document.getElementById('size-slider');
        const widthSlider = document.getElementById('width-slider');
        const heightSlider = document.getElementById('height-slider');
        const rotationSlider = document.getElementById('rotation-slider');
        const intensitySlider = document.getElementById('intensity-slider');
        
        sizeSlider.addEventListener('input', (e) => {
            document.getElementById('size-value').textContent = e.target.value;
            if (this.selectedShape && this.selectedShape.type !== 'draw') {
                this.selectedShape.size = parseInt(e.target.value);
                if (!this.selectedShape.width || !this.selectedShape.height) {
                    this.selectedShape.width = parseInt(e.target.value);
                    this.selectedShape.height = parseInt(e.target.value);
                }
                this.redrawOriginal();
                if (this.autoUpdate) {
                    this.scheduleRadonUpdate();
                }
            }
        });
        
        widthSlider.addEventListener('input', (e) => {
            document.getElementById('width-value').textContent = e.target.value;
            if (this.selectedShape && this.selectedShape.type !== 'draw') {
                this.selectedShape.width = parseInt(e.target.value);
                this.redrawOriginal();
                if (this.autoUpdate) {
                    this.scheduleRadonUpdate();
                }
            }
        });
        
        heightSlider.addEventListener('input', (e) => {
            document.getElementById('height-value').textContent = e.target.value;
            if (this.selectedShape && this.selectedShape.type !== 'draw') {
                this.selectedShape.height = parseInt(e.target.value);
                this.redrawOriginal();
                if (this.autoUpdate) {
                    this.scheduleRadonUpdate();
                }
            }
        });
        
        rotationSlider.addEventListener('input', (e) => {
            document.getElementById('rotation-value').textContent = e.target.value + '°';
            if (this.selectedShape && this.selectedShape.type !== 'draw') {
                this.selectedShape.rotation = parseInt(e.target.value);
                this.redrawOriginal();
                if (this.autoUpdate) {
                    this.scheduleRadonUpdate();
                }
            }
        });
        
        intensitySlider.addEventListener('input', (e) => {
            document.getElementById('intensity-value').textContent = parseFloat(e.target.value).toFixed(1);
            if (this.selectedShape) {
                this.selectedShape.intensity = parseFloat(e.target.value);
                this.redrawOriginal();
                if (this.autoUpdate) {
                    this.scheduleRadonUpdate();
                }
            }
        });
        
        // Resolution selector
        const resolutionSelect = document.getElementById('resolution-select');
        resolutionSelect.addEventListener('change', (e) => {
            this.resolution = e.target.value;
            if (this.autoUpdate) {
                this.updateRadonTransformImmediate();
            }
        });
        
        // Clear button
        document.getElementById('clear-canvas').addEventListener('click', () => {
            this.shapes = [];
            this.selectedShape = null;
            this.redrawOriginal();
            if (this.autoUpdate) {
                this.updateRadonTransformImmediate();
            }
            this.updateUI();
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Delete' && this.selectedShape) {
                this.deleteSelectedShape();
            } else if (e.key === 'Escape') {
                this.selectedShape = null;
                this.redrawOriginal();
                this.updateUI();
            } else if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                this.undo();
            } else if (e.ctrlKey && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
                e.preventDefault();
                this.redo();
            } else if (e.ctrlKey && e.key === 'd' && this.selectedShape) {
                e.preventDefault();
                this.duplicateSelectedShape();
            }
        });
    }

    updateCanvasCursor() {
        if (this.currentShapeType === 'draw') {
            this.originalCanvas.style.cursor = 'crosshair';
            document.body.classList.add('drawing-cursor');
        } else {
            this.originalCanvas.style.cursor = 'crosshair';
            document.body.classList.remove('drawing-cursor');
        }
    }
    
    scheduleRadonUpdate() {
        if (!this.autoUpdate) return;
        
        // ביטול עדכון קודם
        if (this.updateTimeout) {
            clearTimeout(this.updateTimeout);
        }
        
        // תזמון עדכון חדש עם עיכוב קטן
        this.updateTimeout = setTimeout(() => {
            this.updateRadonTransform();
        }, 50);
    }
    
    updateRadonTransformImmediate() {
        // עדכון מיידי ללא debouncing
        this.updateRadonTransform();
    }

    saveState() {
        const state = JSON.stringify(this.shapes.map(shape => {
            if (shape.type === 'draw') {
                return {
                    type: shape.type,
                    points: shape.points,
                    intensity: shape.intensity,
                    id: shape.id
                };
            } else {
                return {
                    type: shape.type,
                    x: shape.x,
                    y: shape.y,
                    size: shape.size,
                    width: shape.width,
                    height: shape.height,
                    rotation: shape.rotation,
                    intensity: shape.intensity,
                    id: shape.id
                };
            }
        }));
        
        // Remove future history if we're in the middle
        this.history = this.history.slice(0, this.historyIndex + 1);
        this.history.push(state);
        
        // Limit history size
        if (this.history.length > 50) {
            this.history.shift();
        } else {
            this.historyIndex++;
        }
    }
    
    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.loadState(this.history[this.historyIndex]);
        }
    }
    
    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.loadState(this.history[this.historyIndex]);
        }
    }
    
    loadState(stateString) {
        const shapeData = JSON.parse(stateString);
        this.shapes = shapeData.map(data => {
            if (data.type === 'draw') {
                const drawPath = new DrawPath(data.points, data.intensity);
                drawPath.id = data.id;
                return drawPath;
            } else {
                const shape = new Shape(
                    data.type, 
                    data.x, 
                    data.y, 
                    data.size, 
                    data.rotation, 
                    data.intensity,
                    data.width,
                    data.height
                );
                shape.id = data.id;
                return shape;
            }
        });
        this.selectedShape = null;
        this.redrawOriginal();
        if (this.autoUpdate) {
            this.updateRadonTransform();
        }
        this.updateUI();
    }
    
    duplicateSelectedShape() {
        if (this.selectedShape) {
            const original = this.selectedShape;
            let duplicate;
            
            if (original.type === 'draw') {
                // Duplicate draw path with offset
                const offsetPoints = original.points.map(p => ({
                    x: p.x + 20,
                    y: p.y + 20
                }));
                duplicate = new DrawPath(offsetPoints, original.intensity);
            } else {
                duplicate = new Shape(
                    original.type,
                    original.x + 20,
                    original.y + 20,
                    original.size,
                    original.rotation,
                    original.intensity,
                    original.width,
                    original.height
                );
            }
            
            this.shapes.push(duplicate);
            this.selectedShape = duplicate;
            this.saveState();
            this.updateControlPanelValues();
            this.redrawOriginal();
            if (this.autoUpdate) {
                this.updateRadonTransform();
            }
            this.updateUI();
        }
    }
    
    deleteSelectedShape() {
        if (this.selectedShape) {
            const index = this.shapes.indexOf(this.selectedShape);
            if (index > -1) {
                this.shapes.splice(index, 1);
                this.selectedShape = null;
                this.saveState();
                this.redrawOriginal();
                if (this.autoUpdate) {
                    this.updateRadonTransform();
                }
                this.updateUI();
            }
        }
    }
    
    updateUI() {
        // Update shape count
        document.getElementById('shape-count').textContent = `צורות: ${this.shapes.length}`;
        
        // Update selected shape info
        const selectedInfo = document.getElementById('selected-info');
        const shapeDetails = document.getElementById('shape-details');
        
        if (this.selectedShape) {
            const shapeNames = {
                'ellipse': 'אליפסה',
                'rectangle': 'מלבן',
                'triangle': 'משולש',
                'star': 'כוכב',
                'draw': 'ציור חופשי'
            };
            
            if (this.selectedShape.type === 'draw') {
                selectedInfo.textContent = `נבחר: ${shapeNames[this.selectedShape.type]} (${this.selectedShape.points.length} נקודות)`;
                shapeDetails.style.display = 'none';
            } else {
                selectedInfo.textContent = `נבחר: ${shapeNames[this.selectedShape.type]}`;
                shapeDetails.style.display = 'block';
                
                // עדכון פרטי הצורה
                document.getElementById('position-info').textContent = 
                    `(${Math.round(this.selectedShape.x)}, ${Math.round(this.selectedShape.y)})`;
                
                if (this.selectedShape.width && this.selectedShape.height) {
                    document.getElementById('size-info').textContent = 
                        `${Math.round(this.selectedShape.width)} × ${Math.round(this.selectedShape.height)}`;
                } else {
                    document.getElementById('size-info').textContent = Math.round(this.selectedShape.size);
                }
                
                document.getElementById('rotation-info').textContent = 
                    `${Math.round(this.selectedShape.rotation)}°`;
                document.getElementById('intensity-info').textContent = 
                    this.selectedShape.intensity.toFixed(1);
            }
        } else {
            selectedInfo.textContent = 'לא נבחרה צורה';
            shapeDetails.style.display = 'none';
        }
    }

    getMousePos(e) {
        const rect = this.originalCanvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }

    handleMouseDown(e) {
        const pos = this.getMousePos(e);
        
        if (this.currentShapeType === 'draw') {
            // Start drawing
            this.isDrawing = true;
            this.drawPath = [pos];
        } else {
            const clickedShape = this.findShapeAt(pos.x, pos.y);
            
            // אם לוחצים Shift או אין צורה במקום, יוצר צורה חדשה
            if (e.shiftKey || !clickedShape) {
                // Create new shape with initial creation mode
                const size = parseInt(document.getElementById('size-slider').value);
                const width = parseInt(document.getElementById('width-slider').value);
                const height = parseInt(document.getElementById('height-slider').value);
                const intensity = parseFloat(document.getElementById('intensity-slider').value);
                
                const newShape = new Shape(this.currentShapeType, pos.x, pos.y, size, 0, intensity, width, height);
                newShape.isCreating = true; // מצב יצירה
                this.shapes.push(newShape);
                this.selectedShape = newShape;
                this.isDragging = true;
                this.isCreating = true; // מצב יצירה גלובלי
                this.dragStart = pos;
                this.updateControlPanelValues();
            } else {
                // Select existing shape
                this.selectedShape = clickedShape;
                this.isDragging = true;
                this.isRotating = e.ctrlKey;
                this.dragStart = pos;
                this.updateControlPanelValues();
            }
        }
        
        this.redrawOriginal();
    }

    handleMouseMove(e) {
        const pos = this.getMousePos(e);
        
        if (this.isDrawing) {
            // Continue drawing
            this.drawPath.push(pos);
            this.redrawOriginal();
            this.drawCurrentPath();
        } else if (this.isDragging && this.selectedShape) {
            if (this.isCreating) {
                // יצירת צורה עם גרירה - התאמת גודל לפי המרחק
                const dx = pos.x - this.dragStart.x;
                const dy = pos.y - this.dragStart.y;
                
                if (this.selectedShape.type === 'rectangle' || this.selectedShape.type === 'ellipse') {
                    // עבור מלבן ואליפסה - שינוי רוחב וגובה
                    this.selectedShape.width = Math.abs(dx * 2);
                    this.selectedShape.height = Math.abs(dy * 2);
                    this.selectedShape.x = this.dragStart.x + dx / 2;
                    this.selectedShape.y = this.dragStart.y + dy / 2;
                    
                    // עדכון מחוונים
                    document.getElementById('width-slider').value = this.selectedShape.width;
                    document.getElementById('width-value').textContent = this.selectedShape.width;
                    document.getElementById('height-slider').value = this.selectedShape.height;
                    document.getElementById('height-value').textContent = this.selectedShape.height;
                } else {
                    // עבור צורות עגולות - שינוי גודל לפי המרחק
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    this.selectedShape.size = Math.max(10, distance);
                    this.selectedShape.width = this.selectedShape.size;
                    this.selectedShape.height = this.selectedShape.size;
                    
                    // עדכון מחוון גודל
                    document.getElementById('size-slider').value = this.selectedShape.size;
                    document.getElementById('size-value').textContent = this.selectedShape.size;
                }
            } else if (this.isRotating) {
                // Calculate rotation based on mouse movement
                const dx = pos.x - this.selectedShape.x;
                const dy = pos.y - this.selectedShape.y;
                const angle = Math.atan2(dy, dx) * 180 / Math.PI;
                this.selectedShape.rotation = (angle + 360) % 360;
                document.getElementById('rotation-slider').value = this.selectedShape.rotation;
                document.getElementById('rotation-value').textContent = Math.round(this.selectedShape.rotation) + '°';
            } else {
                // Move shape
                if (this.selectedShape.type === 'draw') {
                    // Move draw path
                    const dx = pos.x - this.dragStart.x;
                    const dy = pos.y - this.dragStart.y;
                    this.selectedShape.points = this.selectedShape.points.map(p => ({
                        x: p.x + dx,
                        y: p.y + dy
                    }));
                    this.dragStart = pos;
                } else {
                    this.selectedShape.x = pos.x;
                    this.selectedShape.y = pos.y;
                }
            }
            
            this.redrawOriginal();
            if (this.autoUpdate) {
                this.scheduleRadonUpdate();
            }
        }
    }

    handleMouseUp(e) {
        if (this.isDrawing) {
            // Finish drawing
            if (this.drawPath.length > 1) {
                const intensity = parseFloat(document.getElementById('intensity-slider').value);
                const drawPath = new DrawPath(this.drawPath, intensity);
                this.shapes.push(drawPath);
                this.selectedShape = drawPath;
                this.saveState();
                this.updateUI();
                if (this.autoUpdate) {
                    this.updateRadonTransformImmediate();
                }
            }
            this.isDrawing = false;
            this.drawPath = [];
        }
        
        if (this.isCreating && this.selectedShape) {
            // סיום יצירת צורה
            this.selectedShape.isCreating = false;
            this.isCreating = false;
            this.saveState();
            if (this.autoUpdate) {
                this.updateRadonTransformImmediate();
            }
            this.updateUI();
        }
        
        this.isDragging = false;
        this.isRotating = false;
    }

    drawCurrentPath() {
        if (this.drawPath.length < 2) return;
        
        this.originalCtx.save();
        this.originalCtx.strokeStyle = '#5a67d8';
        this.originalCtx.lineWidth = 3;
        this.originalCtx.lineCap = 'round';
        this.originalCtx.lineJoin = 'round';
        this.originalCtx.globalAlpha = 0.7;
        
        this.originalCtx.beginPath();
        this.originalCtx.moveTo(this.drawPath[0].x, this.drawPath[0].y);
        
        for (let i = 1; i < this.drawPath.length; i++) {
            this.originalCtx.lineTo(this.drawPath[i].x, this.drawPath[i].y);
        }
        
        this.originalCtx.stroke();
        this.originalCtx.restore();
    }

    findShapeAt(x, y) {
        // Search from last to first (top to bottom)
        for (let i = this.shapes.length - 1; i >= 0; i--) {
            if (this.shapes[i].contains(x, y)) {
                return this.shapes[i];
            }
        }
        return null;
    }

    updateControlPanelValues() {
        if (this.selectedShape) {
            if (this.selectedShape.type !== 'draw') {
                document.getElementById('size-slider').value = this.selectedShape.size;
                document.getElementById('size-value').textContent = this.selectedShape.size;
                
                // עדכון רוחב וגובה
                if (this.selectedShape.width !== undefined) {
                    document.getElementById('width-slider').value = this.selectedShape.width;
                    document.getElementById('width-value').textContent = this.selectedShape.width;
                }
                if (this.selectedShape.height !== undefined) {
                    document.getElementById('height-slider').value = this.selectedShape.height;
                    document.getElementById('height-value').textContent = this.selectedShape.height;
                }
                
                document.getElementById('rotation-slider').value = this.selectedShape.rotation;
                document.getElementById('rotation-value').textContent = Math.round(this.selectedShape.rotation) + '°';
            }
            document.getElementById('intensity-slider').value = this.selectedShape.intensity;
            document.getElementById('intensity-value').textContent = this.selectedShape.intensity.toFixed(1);
        }
    }

    redrawOriginal() {
        // Clear canvas
        this.originalCtx.fillStyle = '#f7fafc';
        this.originalCtx.fillRect(0, 0, this.originalCanvas.width, this.originalCanvas.height);
        
        // Mark all shapes as not selected
        this.shapes.forEach(shape => shape.selected = false);
        
        // Mark selected shape
        if (this.selectedShape) {
            this.selectedShape.selected = true;
        }
        
        // Draw all shapes
        this.shapes.forEach(shape => shape.draw(this.originalCtx));
        
        // Draw grid
        if (this.showGrid) {
            this.drawGrid();
        }
    }

    drawGrid() {
        this.originalCtx.save();
        this.originalCtx.strokeStyle = '#e2e8f0';
        this.originalCtx.lineWidth = 0.5;
        this.originalCtx.globalAlpha = 0.3;
        
        const gridSize = 20;
        
        // Vertical lines
        for (let x = 0; x < this.originalCanvas.width; x += gridSize) {
            this.originalCtx.beginPath();
            this.originalCtx.moveTo(x, 0);
            this.originalCtx.lineTo(x, this.originalCanvas.height);
            this.originalCtx.stroke();
        }
        
        // Horizontal lines
        for (let y = 0; y < this.originalCanvas.height; y += gridSize) {
            this.originalCtx.beginPath();
            this.originalCtx.moveTo(0, y);
            this.originalCtx.lineTo(this.originalCanvas.width, y);
            this.originalCtx.stroke();
        }
        
        this.originalCtx.restore();
    }

    updateRadonTransform() {
        if (this.isUpdating) return; // מניעת עדכונים מקבילים
        
        this.isUpdating = true;
        const startTime = performance.now();
        
        // שימוש ב-requestAnimationFrame לעדכון חלק
        requestAnimationFrame(() => {
            try {
                // Get current canvas as ImageData
                const imageData = this.originalCtx.getImageData(
                    0, 0, 
                    this.originalCanvas.width, 
                    this.originalCanvas.height
                );
                
                // Set resolution parameters
                let numAngles, numDistances;
                switch (this.resolution) {
                    case 'low':
                        numAngles = 60;
                        numDistances = 150;
                        break;
                    case 'medium':
                        numAngles = 90;
                        numDistances = 200;
                        break;
                    case 'high':
                        numAngles = 180;
                        numDistances = 300;
                        break;
                }
                
                // Process with Radon Transform
                const radonImageData = this.radonTransform.processImage(
                    imageData,
                    this.radonCanvas.width,
                    this.radonCanvas.height,
                    numAngles,
                    numDistances
                );
                
                // Clear radon canvas
                this.radonCtx.fillStyle = '#f7fafc';
                this.radonCtx.fillRect(0, 0, this.radonCanvas.width, this.radonCanvas.height);
                
                // Display result
                this.radonCtx.putImageData(radonImageData, 0, 0);
                
                // Add axes labels
                this.drawRadonAxes();
                
                // Calculate performance
                const endTime = performance.now();
                const processingTime = endTime - startTime;
                
                // Update frame rate calculation
                this.frameCount++;
                if (endTime - this.lastUpdateTime > 1000) {
                    this.fps = Math.round(this.frameCount * 1000 / (endTime - this.lastUpdateTime));
                    this.frameCount = 0;
                    this.lastUpdateTime = endTime;
                }
            } catch (error) {
                console.error('Error updating Radon transform:', error);
            } finally {
                this.isUpdating = false;
            }
        });
    }

    drawRadonAxes() {
        this.radonCtx.save();
        this.radonCtx.fillStyle = '#4a5568';
        this.radonCtx.font = '12px Arial';
        
        // ρ axis labels (bottom) - מרחקים
        const distanceLabels = ['-ρmax', '-ρmax/2', '0', 'ρmax/2', 'ρmax'];
        const distancePositions = [0, 100, 200, 300, 400];
        
        distancePositions.forEach((pos, i) => {
            if (pos < this.radonCanvas.width) {
                this.radonCtx.fillText(distanceLabels[i], pos - 15, this.radonCanvas.height - 5);
            }
        });
        
        // θ axis labels (left) - זוויות
        const angleLabels = ['0°', '45°', '90°', '135°', '180°'];
        const anglePositions = [0, 100, 200, 300, 400];
        
        anglePositions.forEach((pos, i) => {
            if (pos < this.radonCanvas.height) {
                this.radonCtx.fillText(angleLabels[i], 5, pos + 5);
            }
        });
        
        this.radonCtx.restore();
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.radonSimulator = new RadonSimulator();
});
