import React, { useRef } from "react";
//import { render } from "react-dom";

import { ColorExtractor } from "react-color-extractor";

//const IMAGE_ONE = "https://i.imgur.com/fBiKbIw.jpg?1";

// need to have an image with crossOrigin="Anonymous"!!!!
const hyrule = "https://i.imgur.com/QEKUtDu.jpg";
const IMAGE_URL = hyrule; //"https://www.dreamincode.net/forums/uploads/post-242958-1246321970.jpg";

const SWATCHES_STYLES = {
  marginTop: 20,
  display: "flex",
  justifyContent: "center",
};

function getAvgColorOfTile(data) {

  let R = 0;
  let G = 0;
  let B = 0;
  let A = 0;
  let wR = 0;
  let wG = 0;
  let wB = 0;
  let wTotal = 0;

  const components = data.length;

  for (let i = 0; i < components; i += 4) {
    // A single pixel (R, G, B, A) will take 4 positions in the array:
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    // Update components for solid color and alpha averages:
    R += r;
    G += g;
    B += b;
    A += a;

    // Update components for alpha-weighted average:
    const w = a / 255;
    wR += r * w;
    wG += g * w;
    wB += b * w;
    wTotal += w;
  }

  const pixelsPerChannel = components / 4;

  // The | operator is used here to perform an integer division:

  R = (R / pixelsPerChannel) | 0;
  G = (G / pixelsPerChannel) | 0;
  B = (B / pixelsPerChannel) | 0;
  wR = (wR / wTotal) | 0;
  wG = (wG / wTotal) | 0;
  wB = (wB / wTotal) | 0;

  // The alpha channel need to be in the [0, 1] range:

  A = A / pixelsPerChannel / 255;

  // Update UI:

  //`rgb(${ R }, ${ G }, ${ B })`;
  //`rgba(${ R }, ${ G }, ${ B }, ${ A.toFixed(2) })`;
  //`rgb(${ wR }, ${ wG }, ${ wB }, ${ A })`;
  return true ? `rgb(${R}, ${G}, ${B})` : `rgb(${ wR }, ${ wG }, ${ wB }, ${ A })`;
}

// https://stackoverflow.com/questions/44556692/javascript-get-average-color-from-a-certain-area-of-an-image/44557266#
export default function Basic() {
  const stage = useRef(null);
  const targetCanvas = useRef(null);
  const destCanvas = useRef(null);

  const [isLoading, setLoading] = React.useState(true);

  const [colors, setState] = React.useState([]);
  const [isMounted, setMounted] = React.useState(false);
  const [canvasDimensions, setCanvasDimensions] = React.useState({
    width: 0,
    height: 0,
  });

  const loadImage = () => {
    const image = new Image();

    image.onload = function () {
      document.getElementById("aerial").setAttribute("src", this.src);
      const naturalWidth = image.naturalWidth;
      const naturalHeight = image.naturalHeight;
      setCanvasDimensions({ width: naturalWidth, height: naturalHeight });
    };

    image.src = IMAGE_URL;
  };

  const renderSwatches = () => {
    return colors.map((color, id) => {
      return (
        <div
          key={id}
          style={{
            backgroundColor: color,
            width: 100,
            height: 100,
          }}
        />
      );
    });
  };

  const getColors = (newColors) => {
    setState((state) => [...colors, ...newColors]);
  };

  const copyImgIntoCanvas = () => {

    const c = document.getElementById("myCanvas");
    const targetCtx = c.getContext("2d");

    const c2 = document.getElementById("myNewCanvas");
    const destCtx = c2.getContext("2d");

    const img = document.getElementById("aerial");
    targetCtx.drawImage(img, 0, 0);

    renderTiles(targetCtx, destCtx);
  };

  const renderTiles = (targetCtx, destCtx) => {
    const tileColors = [];

    console.log("renderTiles");

    const copy = (x, y, tileSize) => {
      var imgData = targetCtx.getImageData(x, y, tileSize, tileSize);

      const color = getAvgColorOfTile(imgData.data);

      destCtx.fillStyle = color;
      destCtx.fillRect(x, y, tileSize, tileSize);

      tileColors.push(color);
    }

    const tileX = 400; // total tiles per x axis 
    const tileY = 400;  // total tiles per y axis 
    const tileSize = 40;
    

    const drawTile = (x, y, z) => {
      copy(x, y, z);
    };

    const processRow = (y, z) => {
      for (let x = 0; x < tileX; x++) {
        const xPos = x * z;
        const yPos = y * z;
        drawTile(xPos, yPos, z);
      }
    };

    const processLayer = (z) => {
      for (let y = 0; y < tileY; y++) {
        processRow(y, z);
      }
    };

    processLayer(tileSize);
  };

  const sleep = m => new Promise(r => setTimeout(r, m))

  const squarify = async () => {
    setLoading(true);
    await sleep(1000)
    copyImgIntoCanvas();
    setLoading(false);
  }

  React.useEffect(() => {
    
    if (stage.current && !isMounted) {
      loadImage();
      setMounted(true);
    }

    if (canvasDimensions.width > 0){
      squarify();
    }

  }, [isMounted, canvasDimensions]);

  const renderTransfer = () => {
    console.log("renderTransfer canvasDimensions: ", canvasDimensions);

    return (
      <div style={{ display: "flex" }}>
        <div style={{ display: "flex" }}>
          <canvas
            ref={targetCanvas}
            id="myCanvas"
            style={{
              display: "block",
              border: "4px solid grey",
            }}
            width={canvasDimensions.width}
            height={canvasDimensions.height}
          />
        </div>
        <div style={{ display: "flex" }}>
          <canvas
             ref={destCanvas}
            id="myNewCanvas"
            style={{
              display: "block",
              border: "4px solid grey",
            }}
            width={canvasDimensions.width}
            height={canvasDimensions.height}
          />
        </div>
      </div>
    );
  };

  return (
    <div ref={stage}>
      <h1>What do I want to see?</h1>
      <p>I want to sample square of the photo</p>
       {isLoading && <h2>Loading</h2>}
       <div style={{display: isLoading ? "none" : "flex"}}>
      {canvasDimensions.width > 0 && renderTransfer()}
      </div>
      <div>
       
        <div style={{display: "none"}}>
        <ColorExtractor getColors={getColors} maxColors={128}>
          <img id="aerial" src={IMAGE_URL} crossOrigin="Anonymous" alt="Iceland aerial" />
        </ColorExtractor>
          </div>
        <div style={{...SWATCHES_STYLES, display: isLoading ? "none" : "flex"}}>{renderSwatches()}</div>
      </div>
    </div>
  );
}
