import * as THREE from 'https://esm.sh/three';
import SpriteText from 'https://esm.sh/three-spritetext';
  import { GUI } from 'https://esm.sh/dat.gui';

let typeDescriptions = {};

async function loadTypeDescriptions() {
  const res = await fetch('type-node-description.json');
  typeDescriptions = await res.json();
}

let highlightedLinks = [];

async function fetchGifData(collectionType) {
  const url = collectionType === 'blueprint' 
    ? 'https://junesbee.com/_functions-dev/allProjectsGif' 
    : 'https://junesbee.com/_functions-dev/allProjectsStarGif';
  try {
      const response = await fetch(url);
  const data = await response.json();

  console.log("data", data);
  
  
  if (data && data.items) {
    const itemsWithGif = data.items.filter(item => item.gif);
    return itemsWithGif;
  } else {
    console.error("No items found in the response.");
    return [];
  }
  } catch (error) {
    console.error("Error fetching GIF data:", error);
    return [];
  }
}

function preloadImages(urls, callback) {
  let loaded = 0;
  const total = urls.length;
  urls.forEach((url) => {
    const img = new Image();
    img.onload = () => {
      loaded++;
      if (loaded === total && callback) {
        callback();
      }
    };
    img.src = url;
  });
}

function convertGifUrl(wixImageUrl) {
  const prefixToRemove = "wix:image://v1/";
  if (wixImageUrl.startsWith(prefixToRemove)) {
    const cleanedUrl = wixImageUrl.slice(prefixToRemove.length);
    const extensionMatch = cleanedUrl.match(/\.(jpg|jpeg|gif|png)/i);
    if (extensionMatch) {
      const extension = extensionMatch[0].toLowerCase();
      return `https://static.wixstatic.com/media/${cleanedUrl.slice(0, cleanedUrl.indexOf(extension) + extension.length)}`;
    }
  }
  return null;
}

async function initGraph() {
  console.log("start initGraph");
  await loadTypeDescriptions();
  const loadingContainer = document.getElementById('loading-container');
  const logoType = loadingContainer.querySelector('.logo-type');

  // Start loading animation
  logoType.classList.remove('loaded');

  try {
    // Fetch GIF data
    const gifItems = await fetchGifData('blueprint');
    console.log('Number of items:', gifItems.length); // Debugging

    // Prepare image URLs
    const imageUrls = gifItems.map(item => convertGifUrl(item.gif)).filter(url => url);

    
    // Preload images
    preloadImages(imageUrls, () => {
      // Create graph data
      const gData = {
        nodes: [],
        links: []
      };

      // Add image nodes
      gifItems.forEach((item, id) => {
          const convertedUrl = convertGifUrl(item.gif);
          if (convertedUrl) {
              gData.nodes.push({
                  id,
                  name: item.title,
                  img: item.gif,
                  imgUrl: convertedUrl,
                  type: item.type, // Add type information
                  x: Math.random() * 1600,
                  y: Math.random() * 1600,
                  z: Math.random() * 1600,
                  url: item.pageUrl,
                  des: item.shortDescription,
                  year: item.year,
                  quest: item.question,
                  answer: item.hook,
                  tech: item.technology
              });
          } else {
              gData.nodes.push({
                  id,
                  name: item.title,
                  img: item.gif,
                  type: item.type, // Add type information
                  x: Math.random() * 1600,
                  y: Math.random() * 1600,
                  z: Math.random() * 1600,
                  url: item.pageUrl,
                  des: item.shortDescription,
                  year: item.year,
                  quest: item.question,
                  answer: item.hook,
                  tech: item.technology
              });
          }
      });


      



      // Add links between image nodes and type nodes
      const typeNodes = {};
      gifItems.forEach((item, id) => {
        item.type.forEach(type => {
          if (!typeNodes[type]) {
            typeNodes[type] = gData.nodes.length;
            gData.nodes.push({
              id: gData.nodes.length,
              name: type, // Name for type node
              isTypeNode: true // Mark as type node
            });
          }
          gData.links.push({
            source: id,
            target: typeNodes[type],
            width: 10
          });
        });
      });

      console.log('Graph data:', gData); // Debugging

      gData.links.forEach(link => {
        const a = gData.nodes[link.source];
        const b = gData.nodes[link.target];
        !a.neighbors && (a.neighbors = []);
        !b.neighbors && (b.neighbors = []);
        a.neighbors.push(b);
        b.neighbors.push(a);

        !a.links && (a.links = []);
        !b.links && (b.links = []);
        a.links.push(link);
        b.links.push(link);
      });

  
      
      
      
      const distance = 500;
      // Highlight sets
      const highlightNodes = new Set();
      const highlightLinks = new Set();
      let hoverNode = null;
      let currentNode = null;

      // Graph initialization
      const Graph = new ForceGraph3D(document.getElementById('3d-graph'))
        .backgroundColor('#ffffff00')
        .linkColor(() => '#000000')
        .linkOpacity(0.5)
        .nodeColor(node => highlightNodes.has(node) ? node === hoverNode ? 'rgb(255,0,0,1)' : 'rgba(255,160,0,0.8)' : 'rgba(0,255,255,0.6)')
        .linkWidth(link => highlightLinks.has(link) ? 3 : 0.5)
        .linkDirectionalParticles(link => highlightLinks.has(link) ? 4 : 0)
        .linkDirectionalParticleWidth(2)
        .cameraPosition({ z: distance })
        .dagMode('lr')
        .onNodeDragEnd(node => {
    node.fx = node.x;
    node.fy = node.y;
    node.fz = node.z;
  })

  
      
  .onNodeClick(node => {


    isRotationActive = false;
    const toggleRotationCheckbox = document.getElementById('toggle-rotation');
    toggleRotationCheckbox.checked = true;

    // Zoom logic
    const ZoomDistance = 40;
    const ZoomDistRatio = 1 + ZoomDistance / Math.hypot(node.x, node.y, node.z);
    const newPos = node.x || node.y || node.z
      ? { x: node.x * ZoomDistRatio, y: node.y * ZoomDistRatio, z: node.z * ZoomDistRatio }
      : { x: 0, y: 0, z: ZoomDistance };

    Graph.cameraPosition(newPos, node, 3000);

    const title = document.getElementById('node-text');
    const desc = document.getElementById('node-description');
    const ques = document.getElementById('node-question');
    const ans = document.getElementById('node-answer');
    const img = document.getElementById('nodeDesImg');
    const qTitle = document.getElementById('node-question-title');
    const aTitle = document.getElementById('node-answer-title');
    const nodeExpand = document.getElementById('node-expand');


    const nodeInfoDiv = document.getElementById('node-info');
    // const nodeText = document.getElementsByClassName('node-text');
    const nodeText = document.getElementById('node-text');
    const nodeTextOutside = document.getElementById('node-text-outside');
    const nodeDes = document.getElementById('node-description');
    const nodeQue = document.getElementById('node-question');
    const nodeAns = document.getElementById('node-answer');
    const nodeImg = document.getElementById('nodeDesImg');
    const projectList = document.getElementById('type-project-list');


  
    title.textContent = node.name;
    nodeExpand.style.display = 'block';
    nodeTextOutside.style.display = 'none';
  
    if (node.isTypeNode) {
      // CATEGORY NODE: show description only
      const info = typeDescriptions[node.name];
      const description = info && info[0] ? info[0].description : 'No description available.';
      desc.textContent = description;
  
      // Hide Q&A elements
      ques.style.display = 'none';
      ans.style.display = 'none';
      aTitle.style.display = 'none';
      qTitle.style.display = 'none';
      img.style.display = 'none';
      projectList.style.display = 'block';

      const typeProjectList = document.getElementById('type-project-list');
      typeProjectList.innerHTML = ''; // Clear previous
      
      const matchingProjects = gData.nodes.filter(n => 
        !n.isTypeNode && n.type && n.type.includes(node.name)
      );
      
      matchingProjects.forEach(project => {
        const imgEl = document.createElement('img');
        imgEl.src = project.imgUrl || '';
        imgEl.alt = project.name;
        imgEl.title = project.name;
        imgEl.className = 'type-project-thumbnail';
      
        // Click to open project URL
        imgEl.addEventListener('click', () => {
          if (project.url) {
            window.open(project.url, '_blank');
          }
        });
      
        typeProjectList.appendChild(imgEl);
      });
      
      
  
    } else {
      // // PROJECT NODE: show all Q&A elements
      // desc.textContent = '';
      // ques.textContent = node.question || 'No question provided.';
      // ans.textContent = node.answer || 'No answer provided.';

      nodeText.innerText = `${node.name}`;  // Change text as needed
      nodeTextOutside.innerText = `${node.name}`;
      nodeInfoDiv.style.display = 'block';  // Show the text box
        nodeDes.innerText = `${node.des}`;
        nodeQue.innerText = `${node.quest}`;
        nodeAns.innerText = `${node.answer}`;
      
      
        projectList.style.display = 'none';
        ques.style.display = 'block';
      ans.style.display = 'block';
      aTitle.style.display = 'block';
      qTitle.style.display = 'block';
      img.style.display = 'block';
  

    }

    if (techBtnsDiv) {
      techBtnsDiv.innerHTML = '';  // Clear existing buttons
      }
        if (node && node.tech && Array.isArray(node.tech)) {
      node.tech.forEach(tech => {
        // Create a new button element
        const techButton = document.createElement('button');
        techButton.classList.add('neu-button');
        techButton.textContent = tech; // Set the button's text to the tech name
      
        // Optionally, you can add a click event to each button if you want to handle interaction
        // Append the button to the div with the id 'techBtnsDiv'
        const techBtnsDiv = document.getElementById('techBtnsDiv');
        if (techBtnsDiv) {
            techBtnsDiv.appendChild(techButton);
        }
      });
      } else {
      // console.log('node or node.tech is not defined or tech is not an array');
      }
  })
  
          .onNodeRightClick(node => {
console.log('rightclick');
const url = node.url; // Assuming the URL is stored in node.img, adjust this if needed
if (url) {
  window.open(url, '_blank');  // Open the URL in a new tab
} else {
  console.log('No URL found for this node.');
}
})

          
        .nodeThreeObject(({ img, isTypeNode, name }) => {
          if (isTypeNode) {
            // Create geometry node for type
            const geometries = [
              new THREE.BoxGeometry(Math.random() * 30, Math.random() * 30, Math.random() * 30),
              new THREE.ConeGeometry(Math.random() * 30, Math.random() * 30),
              new THREE.CylinderGeometry(Math.random() * 30, Math.random() * 20, Math.random() * 30),
              new THREE.DodecahedronGeometry(Math.random() * 30),
              new THREE.SphereGeometry(Math.random() * 30),
              new THREE.TorusGeometry(Math.random() * 30, Math.random() * 3),
              new THREE.TorusKnotGeometry(Math.random() * 30, Math.random() * 3)
          ];

          // Select a geometry based on a unique id or random index
          const geometry = geometries[Math.floor(Math.random() * geometries.length)];

                          
          //   const geometry = new THREE.SphereGeometry(10);
            const material = new THREE.MeshLambertMaterial({
                  color: Math.round(Math.random() * Math.pow(2, 24)),
                  transparent: true,
                  opacity: 0.75
                  });
            const sphere = new THREE.Mesh(geometry, material);
            return sphere;
          } else {
            // Create image node
            const convertedUrl = convertGifUrl(img);
            if (!convertedUrl) return null;
            const imgTexture = new THREE.TextureLoader().load(convertedUrl);
            imgTexture.colorSpace = THREE.SRGBColorSpace;
            const material = new THREE.SpriteMaterial({ map: imgTexture });
            const sprite = new THREE.Sprite(material);
          const originWidthMatch = img.match(/originWidth=(\d+)/);
          const originHeightMatch = img.match(/originHeight=(\d+)/);

          const originalWidth = originWidthMatch ? parseInt(originWidthMatch[1], 10) : 500;
          const originalHeight = originHeightMatch ? parseInt(originHeightMatch[1], 10) : 500;

          const aspectRatio = originalWidth / originalHeight;
          let width, height;
          if (aspectRatio >= 1) {
              width = 25;
              height = width / aspectRatio;
          } else {
              height = 25;
              width = height * aspectRatio;
          }

          if (width < 10) width = 10;
          if (height < 10) height = 10;

          sprite.scale.set(width, height);
            return sprite;
          }
        })
        .graphData(gData)
      //   .d3Force('charge', d3.forceManyBody().strength(-50)) // Reduce the strength to prevent clustering
      //     .d3Force('link', d3.forceLink().distance(200).strength(0.1)) // Increase link distance
      //     .d3Force('center', d3.forceCenter(0, 0, 0)) // Keep nodes roughly centered
        
        .onNodeHover((node) => {
          const title = document.getElementById('node-text');
          const desc = document.getElementById('node-description');
          const ques = document.getElementById('node-question');
          const ans = document.getElementById('node-answer');
          const img = document.getElementById('nodeDesImg');
          const qTitle = document.getElementById('node-question-title');
          const aTitle = document.getElementById('node-answer-title');
          const nodeExpand = document.getElementById('node-expand');
          
          const nodeInfoDiv = document.getElementById('node-info');
          // const nodeText = document.getElementsByClassName('node-text');
          const nodeText = document.getElementById('node-text');
          const nodeTextOutside = document.getElementById('node-text-outside');
          const nodeDes = document.getElementById('node-description');
          const nodeQue = document.getElementById('node-question');
          const nodeAns = document.getElementById('node-answer');
          const nodeImg = document.getElementById('nodeDesImg');
          const projectList = document.getElementById('type-project-list');
          // const nodeImgUrl = convertedUrl(nodeiImgurl);

          

  currentNode = node;
  if (node) {
  if (node.isTypeNode) {
    // CATEGORY NODE: show description only
    const info = typeDescriptions[node.name];
    const description = info && info[0] ? info[0].description : 'No description available.';
    desc.textContent = description;
    nodeText.innerText = `${node.name}`;  // Change text as needed
    nodeTextOutside.innerText = `${node.name}`;

    // Hide Q&A elements
    ques.style.display = 'none';
    ans.style.display = 'none';
    aTitle.style.display = 'none';
    qTitle.style.display = 'none';
    img.style.display = 'none';
    projectList.style.display = 'block';

  // if (node.isTypeNode) {
  //   // const info = typeDescriptions[node.name];
  //   // const description = info && info[0] ? info[0].description : 'No description available.';
  //   nodeText.textContent = node.name;
  //   nodeDes.textContent = description;
  //   nodeQue.style.display = 'none';  // Show the text box
  //   nodeAns.style.display = 'none';  // Show the text box

  const typeProjectList = document.getElementById('type-project-list');
  typeProjectList.innerHTML = ''; // Clear previous
  
  const matchingProjects = gData.nodes.filter(n => 
    !n.isTypeNode && n.type && n.type.includes(node.name)
  );
  
  matchingProjects.forEach(project => {
    const imgEl = document.createElement('img');
    imgEl.src = project.imgUrl || '';
    imgEl.alt = project.name;
    imgEl.title = project.name;
    imgEl.className = 'type-project-thumbnail';
  
    // Click to open project URL
    imgEl.addEventListener('click', () => {
      if (project.url) {
        window.open(project.url, '_blank');
      }
    });
  
    typeProjectList.appendChild(imgEl);
  });
  

  
  }else{
    projectList.style.display = 'none';
    ques.style.display = 'block';
    ans.style.display = 'block';
    aTitle.style.display = 'block';
    qTitle.style.display = 'block';
    img.style.display = 'block';


// Show text when hovering over a node
// if (node) {
nodeText.innerText = `${node.name}`;  // Change text as needed
nodeTextOutside.innerText = `${node.name}`;
nodeInfoDiv.style.display = 'block';  // Show the text box
  nodeDes.innerText = `${node.des}`;
  nodeQue.innerText = `${node.quest}`;
  nodeAns.innerText = `${node.answer}`;

  
  

  let nodeimgUrl = node.imgUrl;
  let nodeimgGif = node.img;
  
if (nodeimgUrl) {
// Extract original dimensions from the URL
const originWidthMatch = nodeimgGif.match(/originWidth=(\d+)/);
const originHeightMatch = nodeimgGif.match(/originHeight=(\d+)/);

// console.log("originWidthMatch: ", originWidthMatch, "originHeightMatch: ", originHeightMatch);

const originalWidth = originWidthMatch ? parseInt(originWidthMatch[1], 10) : 500;
const originalHeight = originHeightMatch ? parseInt(originHeightMatch[1], 10) : 500;

// Calculate aspect ratio
const aspectRatio = originalWidth / originalHeight;

// Define the maximum size for scaling
const maxDimension = 25; // Increase this for larger images
const minDimension = 5;

let width, height;

if (aspectRatio >= 1) {
  // Landscape or square images
  width = maxDimension;
  height = Math.max(minDimension, width / aspectRatio);
} else {
  // Portrait images
  height = maxDimension;
  width = Math.max(minDimension, height * aspectRatio);
}

// Apply the calculated dimensions to the image
nodeImg.src = nodeimgUrl;
nodeImg.style.width = `${width}vw`;
nodeImg.style.height = `${height}vw`;
} else {
console.log("No node.imgUrl or node is null");
}
// }
}

  }




  // create buttons for tech tags

  if (techBtnsDiv) {
techBtnsDiv.innerHTML = '';  // Clear existing buttons
}
  if (node && node.tech && Array.isArray(node.tech)) {
node.tech.forEach(tech => {
  // Create a new button element
  const techButton = document.createElement('button');
  techButton.classList.add('neu-button');
  techButton.textContent = tech; // Set the button's text to the tech name

  // Optionally, you can add a click event to each button if you want to handle interaction
  // Append the button to the div with the id 'techBtnsDiv'
  const techBtnsDiv = document.getElementById('techBtnsDiv');
  if (techBtnsDiv) {
      techBtnsDiv.appendChild(techButton);
  }
});
} else {
// console.log('node or node.tech is not defined or tech is not an array');
}

// No state change
if ((!node && !highlightNodes.size) || (node && hoverNode === node)) return;

highlightNodes.clear();
highlightLinks.clear();
if (node) {
highlightNodes.add(node);
node.neighbors.forEach(neighbor => highlightNodes.add(neighbor));
node.links.forEach(link => highlightLinks.add(link));
}

hoverNode = node || null;

updateHighlight();
})
.onLinkHover(link => {
          highlightNodes.clear();
          highlightLinks.clear();

          if (link) {
            highlightLinks.add(link);
            highlightNodes.add(link.source);
            highlightNodes.add(link.target);
          }

          updateHighlight();
        });


function updateHighlight() {
// This function triggers the graph to re-render by updating the highlighted nodes and links
Graph.nodeColor(Graph.nodeColor())
 .linkWidth(Graph.linkWidth())
 .linkDirectionalParticles(Graph.linkDirectionalParticles());
}

const nodeExpand = document.getElementById('node-expand');

Graph.onBackgroundClick(() => {
console.log('Clicked on empty space');
isRotationActive = true; // Stop rotation
const toggleRotationCheckbox = document.getElementById('toggle-rotation');
toggleRotationCheckbox.checked = false; // Check the input box
nodeExpand.style.display = 'none'; // Show the element (or 'flex' if needed for a flex container)
nodeTextOutside.style.display = 'block'; 
console.log('nodeExpand.style.display');
});

//gui
// const controls = { 'DAG Orientation': 'null'};
//   const gui = new GUI();
//   gui.add(controls, 'DAG Orientation', ['lr', 'td', 'zout', 'radialout', null])
//     .onChange(orientation => Graph && Graph.dagMode(orientation));

//tab
const tabs = document.querySelectorAll('.tab');
tabs.forEach((tab, index) => {
tab.addEventListener('change', () => {
  const orientations = ['lr', 'td', 'zout', 'radialout', null]; // Map to DAG orientations
  const selectedOrientation = orientations[index];
  if (Graph) {
  Graph.dagMode(selectedOrientation);
  }
});
});


      
      //rotation animation
      let angle = 0;
      let isRotationActive = true;
      setInterval(() => {
      if (isRotationActive) {
          Graph.cameraPosition({
          x: distance * Math.sin(angle),
          z: distance * Math.cos(angle)
          });
          angle += Math.PI / 1000;
      }
      }, 10);



const toggleRotationLabel = document.querySelector('.switch');
const selfRotateSpan = toggleRotationLabel.children[1]; // First span: "Self Rotate"
const clickToZoomSpan = toggleRotationLabel.children[2]; // Second span: "Click to Zoom"


selfRotateSpan.addEventListener('click', () => {
isRotationActive = true; // Enable rotation
toggleRotationCheckbox.checked = true; // Check the input box
console.log('Self Rotate clicked');
animateSpan(selfRotateSpan);
});

clickToZoomSpan.addEventListener('click', () => {
isRotationActive = false; // Disable rotation
toggleRotationCheckbox.checked = false; // Uncheck the input box
console.log('Click to Zoom clicked');
animateSpan(clickToZoomSpan);
});

      

      // Select the checkbox and the mouse-canvas div
      const scribbleBtn = document.getElementById('scribbleBtn');
      const mouseCanvas = document.getElementById('mouse-canvas');
      let scribbleBtnActive = true;

      // Add event listener to toggle the visibility of mouse-canvas
      scribbleBtn.addEventListener('change', function() {
          // scribbleBtnActive = !scribbleBtnActive;
          if (scribbleBtn.checked) {
              // If checked, show the canvas
              mouseCanvas.style.display = 'block';
          } else {
              // If unchecked, hide the canvas
              mouseCanvas.style.display = 'none';
          }
      });


      //expand description code
      let expandDesActive = false;
      const nodeTextOutside = document.getElementById('node-text-outside');

      nodeTextOutside.addEventListener('click', () => {
          expandDesActive = !expandDesActive; // Toggle the active state
          
          const nodeExpand = document.getElementById('node-expand');
          
          
          // Toggle the display property based on the expandDesActive state
          if (expandDesActive) {
              nodeExpand.style.display = 'block'; // Show the element (or 'flex' if needed for a flex container)
              nodeTextOutside.style.display = 'none'; 
              
          } else {
              nodeExpand.style.display = 'none'; // Hide the element
              nodeTextOutside.style.display = 'block'; 
          }
          
      });

      
      document.getElementById('node-text').addEventListener('click', () => {
          const url = currentNode.url; // Assuming the URL is stored in node.img, adjust this if needed
          if (url) {
              console.log('open url:', url);
              window.open(url, '_blank');  // Open the URL in a new tab
          } else {
              console.log('No URL found for this node.');
          }
      });
      
      
      document.getElementById('desToggleBtn').addEventListener('click', () => {
          expandDesActive = !expandDesActive; // Toggle the active state
          
          const nodeExpand = document.getElementById('node-expand');
          
          
          // Toggle the display property based on the expandDesActive state
          if (expandDesActive) {
              nodeExpand.style.display = 'block'; // Show the element (or 'flex' if needed for a flex container)
              nodeTextOutside.style.display = 'none'; 
              
          } else {
              nodeExpand.style.display = 'none'; // Hide the element
              nodeTextOutside.style.display = 'block'; 
          }
      });

      document.getElementById('closeNodeInfoBtn').addEventListener('click', () => {
          expandDesActive = !expandDesActive; // Toggle the active state
          
          const nodeExpand = document.getElementById('node-expand');
          
          
          // Toggle the display property based on the expandDesActive state
          if (expandDesActive) {
              nodeExpand.style.display = 'block'; // Show the element (or 'flex' if needed for a flex container)
              nodeTextOutside.style.display = 'none'; 
              
          } else {
              nodeExpand.style.display = 'none'; // Hide the element
              nodeTextOutside.style.display = 'block'; 
          }
      });

      document.getElementById("node-text").style.cursor = "url('https://junebee66.github.io/June-Cloud-Gallery/images/Arrow.png'), auto";
      document.getElementById("node-text-outside").style.cursor = "url('https://junebee66.github.io/June-Cloud-Gallery/images/Arrow.png'), auto";
      document.getElementById("3d-graph").style.cursor = "url('https://i.pinimg.com/736x/d2/d0/aa/d2d0aa2ec86432ccc1d2a936fe8b239e.jpg'), auto";

      

      // Hide loading animation and show graph
      logoType.classList.add('loaded');
      setTimeout(() => {
        loadingContainer.style.display = 'none';
        mouseCanvas.style.display = 'none';
        document.getElementById('june-logo').style.display = 'block';
      }, 5000);
      document.getElementById('3d-graph').style.display = 'block';
      })
    
  } catch (error) {
  //   console.error('Error:', error);
  }
}
// Call initGraph when the document is ready
document.addEventListener('DOMContentLoaded', initGraph);