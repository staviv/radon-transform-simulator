# Radon Transform Simulator

An interactive Radon Transform simulation that allows users to explore the mathematical principles of this transformation in a visual and intuitive way.

## 🌟 Try it Now
**[Click here to try the simulator](https://staviv.github.io/radon-transform-simulator/)**

## Key Features

### 🎨 Interactive Shape Creation
- **Ellipse, Rectangle, Triangle, and Star** - Four basic and flexible shapes
- **Drag-to-create** - Drag the mouse to determine size and shape
- **Real-time manipulation** - Drag, rotate, and resize shapes
- **Intensity control** - Adjust shape intensity for different results

### 📊 Real-time Radon Transform
- **Instant updates** - See Radon Transform changes in real-time
- **Color visualization** - Intuitive color mapping for understanding results
- **Clear coordinate axes** - Display of angles (θ) and distances (ρ)

### 💻 Cross-platform Compatibility
- **All platforms** - Works in any modern browser without installation
- **Responsive design** - Adapted for computers, tablets, and smartphones
- **Hebrew interface** - Full Hebrew UI with RTL support

## How to Use

### Instant Web Use
Simply click the link above - the simulator runs directly in your browser!

### Local Setup
1. **Clone the project**:
   ```bash
   git clone https://github.com/staviv/radon-transform-simulator.git
   cd radon-transform-simulator
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the server**:
   ```bash
   npm start
   ```

4. **Open in browser**: `http://localhost:3000`

### Using the Simulator

#### Adding Shapes
1. Select a shape type from the left panel (ellipse/rectangle/triangle/star)
2. Click on the left canvas where you want to place it
3. Drag without releasing to determine size and shape
4. Release to finish creating the shape

#### Editing Shapes
- **Select**: Click on an existing shape
- **Move**: Drag selected shape
- **Rotate**: Ctrl + drag
- **Add over existing**: Shift + click
- **Resize**: Use size/width/height sliders
- **Intensity**: Adjust with intensity slider
- **Delete**: Select shape and press Delete
- **Undo/Redo**: Ctrl+Z/Y

#### Viewing Results
- Right canvas displays the Radon Transform
- X-axis represents angles (0-180 degrees)  
- Y-axis represents distances (-ρmax to ρmax)

## Understanding the Radon Transform

The Radon Transform is used in medical imaging (CT scans), image processing, and computer vision. It creates projections of images at different angles, helping detect lines and shapes.

## Technical Details

Built with vanilla JavaScript, HTML5 Canvas, and modern CSS. Features real-time computation, responsive design, and Hebrew RTL interface.

## License

MIT License - See LICENSE file for details.

---

**Developed with ❤️ for the research and educational community**
