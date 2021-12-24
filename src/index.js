import React from "react";
import ReactDOM from "react-dom";
import MagicDropzone from "react-magic-dropzone";
import { useRef, useState, useEffect } from "react";
import "./styles.css";
import Webcam from "react-webcam";

const tf = require('@tensorflow/tfjs');
//const webcamElement = document.getElementById('webcam');
    
 const weights = "https://raw.githubusercontent.com/mdhasanali3/object-detection-with-yolov5-tfjs/master/public/web_model/model.json";
 //'web_model/model.json';
 
  //'C:/Users/hasan/Downloads/bs 23 workshop/supershop/yolov5/yolov5s_saved_model/keras_metadata.pb');
//'C:/Users/hasan/Downloads/bs 23 workshop/ss/tfj/public/web_model/model.json';
 

/*
'Alpro-Fresh-Soy-Milk','Arla-Medium-Fat-Milk','Arla-Mild-Vanilla-Yoghurt','Arla-Natural-Yoghurt',
              'Arla-Sour-Milk','Bravo-Orange-Juice','Garant-Ecological-Medium-Fat-Milk','Oatly-Natural-Oatghurt',
              'Oatly-Oat-Milk','Tropicana-Apple-Juice','Valio-Vanilla-Yoghurt','Yoggi-Strawberry-Yoghurt',

*/
const names = ['person','bicycle', 'car', 'motorcycle', 'airplane', 'bus', 'train', 'truck', 'boat', 'traffic light',
               'fire hydrant', 'stop sign', 'parking meter', 'bench', 'bird', 'cat', 'dog', 'horse', 'sheep', 'cow',
               'elephant', 'bear', 'zebra', 'giraffe', 'backpack', 'umbrella', 'handbag', 'tie', 'suitcase', 'frisbee',
               'skis', 'snowboard', 'sports ball', 'kite', 'baseball bat', 'baseball glove', 'skateboard', 'surfboard',
               'tennis racket', 'bottle', 'wine glass', 'cup', 'fork', 'knife', 'spoon', 'bowl', 'banana', 'apple',
               'sandwich', 'orange', 'broccoli', 'carrot', 'hot dog', 'pizza', 'donut', 'cake', 'chair', 'couch',
               'potted plant', 'bed', 'dining table', 'toilet', 'tv', 'laptop', 'mouse', 'remote', 'keyboard', 'cell phone',
               'microwave', 'oven', 'toaster', 'sink', 'refrigerator', 'book', 'clock', 'vase', 'scissors', 'teddy bear',
               'hair drier', 'toothbrush']
const map = new Map();

for (var i = 0; i < 100; ++i) {
  map.set(names[i],0);
}
const [modelWeight, modelHeight] = [640 , 640];

/////for video

const threshold = 0.35;
//const video = document.getElementById('webcam');
const liveView = document.getElementById('liveView');
const demosSection = document.getElementById('demos');
const enableWebcamButton = document.getElementById('webcamButton');
//const floc=document.getElementById('locals');


// async function load_model() {
//   // It's possible to load the model locally or from a repo
//   // You can choose whatever IP and PORT you want in the "http://127.0.0.1:8080/model.json" just set it before in your https server
//   //const model = await loadGraphModel("http://127.0.0.1:8080/model.json");
//   const model = await tf.loadGraphModel("https://raw.githubusercontent.com/mdhasanali3/object-detection-with-yolov5-tfjs/master/public/web_model/model.json");

//   return model;
// }


class App extends React.Component {


  
   videoRef = React.createRef();
   canvasRef = React.createRef();
  state = {
    model: null,
    preview: "",
    predictions: []
  };
 
 componentDidMount() { 

    tf.loadGraphModel(weights).then(model => {
      this.setState({
        model: model
      });
      
   //Check if webcam access is supported.
function getUserMediaSupported() {
  return !!(navigator.mediaDevices &&
    navigator.mediaDevices.getUserMedia);
}

//If webcam supported, add event listener to button for when user
//wants to activate it to call enableCam function which we will 
//define in the next step.
// if (getUserMediaSupported()) {
//   enableWebcamButton.addEventListener('click', enableCam);
// } else {
//   console.warn('getUserMedia() is not supported by your browser');
// }

//Placeholder function for next step. Paste over this in the next step.
// //Enable the live webcam view and start classification.
// function enableCam(event) {
//   // Only continue if the COCO-SSD has finished loading.
//   if (!model) {
//     return;
//   }
  
  //Hide the button once clicked.
 //event.target.classList.add('removed');  
  
  //getUsermedia parameters to force video but not audio.
  

      if (navigator.mediaDevices 
        && navigator.mediaDevices.getUserMedia) {
        const webCamPromise = navigator.mediaDevices
          .getUserMedia({
            audio: false,
            video: {
              facingMode: "user"
            }
          })
          .then(stream => {
            window.stream = stream;
            this.videoRef.current.srcObject = stream;
            return new Promise((resolve, reject) => {
              this.videoRef.current.onloadedmetadata = () => {
                resolve();
              };
            });
          });
  
        const modelPromise = model;
  
        Promise.all([modelPromise, webCamPromise])
          .then(values => {
            this.detectFrame(this.videoRef.current, values[0]);
          })
          .catch(error => {
            console.error(error);
          });
      }
    
    })

  }


  detectFrame = (video, model) => {
    tf.engine().startScope();

    // model.executeAsync(this.process_input(video)).then(predictions => {
    // this.renderPredictions(predictions, video);
    const input = tf.tidy(() => {
      return tf.image.resizeBilinear(tf.browser.fromPixels(video).toInt(), [modelWeight, modelHeight])
        .div(255.0).expandDims(0);
    });


  this.state.model.executeAsync(input).then(predictions => {
    this.renderPredictions(predictions, video);


    requestAnimationFrame(() => {
      this.detectFrame(video, model);
    });
  //  tf.engine().endScope();
  });

};

/////////for webcam
renderPredictions = predictions => {
const ctx = this.canvasRef.current.getContext("2d");
ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

const c = document.getElementById("web");
// Font options.
const font = "16px sans-serif";
ctx.font = font;
ctx.textBaseline = "top";

//Getting predictions



const [boxes, scores, classes, valid_detections] = predictions;
      const boxes_data = boxes.dataSync();
      const scores_data = scores.dataSync();
      const classes_data = classes.dataSync();
      const valid_detections_data = valid_detections.dataSync()[0];

     // tf.dispose(predictions)

      var i;
      
      for (i = 0; i < valid_detections_data; ++i){
        let [x1, y1, x2, y2] = boxes_data.slice(i * 4, (i + 1) * 4);
        x1 *= c.width;
        x2 *= c.width;
        y1 *= c.height;
        y2 *= c.height;

        
        const width = x2 - x1;
        const height = y2 - y1;
        const klass = names[classes_data[i]];
        const score = scores_data[i].toFixed(4);

        // Draw the bounding box.
        ctx.strokeStyle = "#00FFFF";
        ctx.lineWidth = 4;
        ctx.strokeRect(x1, y1, width, height);

        // Draw the label background.
        ctx.fillStyle = "#00FFFF";
        const textWidth = ctx.measureText(klass + ":" + score).width;
        const textHeight = parseInt(font, 10); // base 10
        ctx.fillRect(x1, y1, textWidth + 4, textHeight + 4);

      }
     // var counter=[0],counterk=[];
      for (i = 0; i < valid_detections_data; ++i){
        let [x1, y1, , ] = boxes_data.slice(i * 4, (i + 1) * 4);
        x1 *= c.width;
        y1 *= c.height;
        const klass = names[classes_data[i]];
        const score = scores_data[i].toFixed(2);

        // Draw the text last to ensure it's on top.
        ctx.fillStyle = "#000000";
        ctx.fillText(klass + ":" + score, x1, y1);

        var value=map.get(klass);
        map.set(klass, value + 1);// incrementing value
       
      }
      for (const [key, value] of map) {
       if(value>0){
        console.log(key + ' = ' + value)
      }}






};


  onDrop = (accepted, rejected, links) => {
    this.setState({ preview: accepted[0].preview || links[0] });
  };

  cropToCanvas = (image, canvas, ctx) => {
    const naturalWidth = image.naturalWidth;
    const naturalHeight = image.naturalHeight;

    canvas.width = image.width;
    canvas.height = image.height;

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const ratio = Math.min(canvas.width / image.naturalWidth, canvas.height / image.naturalHeight);
    const newWidth = Math.round(naturalWidth * ratio);
    const newHeight = Math.round(naturalHeight * ratio);
    ctx.drawImage(
      image,
      0,
      0,
      naturalWidth,
      naturalHeight,
      (canvas.width - newWidth) / 2,
      (canvas.height - newHeight) / 2,
      newWidth,
      newHeight,
    );

  };



  onImageChange = e => {
    const c = document.getElementById("canvas");
    const ctx = c.getContext("2d");
    this.cropToCanvas(e.target, c, ctx);
    const input = tf.tidy(() => {
      return tf.image.resizeBilinear(tf.browser.fromPixels(c), [modelWeight, modelHeight])
        .div(255.0).expandDims(0);
    });
    this.state.model.executeAsync(input).then(res => {
      // Font options.
      const font = "16px sans-serif";
      ctx.font = font;
      ctx.textBaseline = "top";

      const [boxes, scores, classes, valid_detections] = res;
      const boxes_data = boxes.dataSync();
      const scores_data = scores.dataSync();
      const classes_data = classes.dataSync();
      const valid_detections_data = valid_detections.dataSync()[0];

      tf.dispose(res)

      var i;
      
      for (i = 0; i < valid_detections_data; ++i){
        let [x1, y1, x2, y2] = boxes_data.slice(i * 4, (i + 1) * 4);
        x1 *= c.width;
        x2 *= c.width;
        y1 *= c.height;
        y2 *= c.height;
        const width = x2 - x1;
        const height = y2 - y1;
        const klass = names[classes_data[i]];
        const score = scores_data[i].toFixed(4);

        // Draw the bounding box.
        ctx.strokeStyle = "#00FFFF";
        ctx.lineWidth = 4;
        ctx.strokeRect(x1, y1, width, height);

        // Draw the label background.
        ctx.fillStyle = "#00FFFF";
        const textWidth = ctx.measureText(klass + ":" + score).width;
        const textHeight = parseInt(font, 10); // base 10
        ctx.fillRect(x1, y1, textWidth + 4, textHeight + 4);

      }
     // var counter=[0],counterk=[];
      for (i = 0; i < valid_detections_data; ++i){
        let [x1, y1, , ] = boxes_data.slice(i * 4, (i + 1) * 4);
        x1 *= c.width;
        y1 *= c.height;
        const klass = names[classes_data[i]];
        const score = scores_data[i].toFixed(2);

        // Draw the text last to ensure it's on top.
        ctx.fillStyle = "#000000";
        ctx.fillText(klass + ":" + score, x1, y1);

        var value=map.get(klass);
        map.set(klass, value + 1);// incrementing value
       
      }
      for (const [key, value] of map) {
       if(value>0){
        console.log(key + ' from drag drop = ' + value)
      }}
     
    });
  };

  render() {
return ( 

  //floc.addEventListener('loadeddata', 
<>     





<div>
        
        <h3>yoloV5</h3>
        <video
          style={{height: "640", width:"640"}}
          className="size"
          autoPlay
          playsInline
          muted
          ref={this.videoRef}
          width="640"
          height="640"
          id="frame"
   
   />
   

   <canvas id="web"
          className="size"
          ref={this.canvasRef}
          width="640"
          height="640"       />


      </div>



      <div className="Dropzone-page">

{this.state.model ?
 (
   <MagicDropzone className="Dropzone" accept="image/jpeg, image/png, .jpg, .jpeg, .png"
     multiple={false} onDrop={this.onDrop}>

     {this.state.preview ?
       (
         <img alt="upload preview" onLoad={this.onImageChange} className="Dropzone-img" src={this.state.preview} />
         )
       :
       ("Choose or drop a file.")}

     <canvas id="canvas" width="640" height="640" />
   </MagicDropzone>
 )
 :
 (<div className="Dropzone">Loading model...</div>)
 }

</div> 






</>


 ); 
   
  }
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);


