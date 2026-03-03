const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d");

const sceneLabel = document.getElementById("sceneLabel");
const itemsLabel = document.getElementById("itemsLabel");
const preset = document.getElementById("preset");

let world = null;
let particles = [];

function rand(min, max){ return Math.random()*(max-min)+min; }

function makeWorldFromDummy(scene){
  // “AI結果っぽいJSON”をダミー生成
  if(scene === "forest"){
    return { scene:"forest", items:[ {type:"bird", count:6}, {type:"wind", count:3} ] };
  }
  if(scene === "city"){
    return { scene:"city", items:[ {type:"car", count:5}, {type:"speech", count:3} ] };
  }
  return { scene:"sea", items:[ {type:"water", count:6}, {type:"seagull", count:3} ] };
}

function applyWorld(w){
  world = w;
  sceneLabel.textContent = w.scene;
  itemsLabel.textContent = w.items.map(x=>`${x.type}×${x.count}`).join(", ");

  particles = [];
  const baseY = 320;

  // “ステージ”生成：背景色と地面パターン
  for(const it of w.items){
    for(let i=0;i<it.count;i++){
      particles.push({
        type: it.type,
        x: rand(20, canvas.width-20),
        y: rand(40, baseY-80),
        vx: rand(-0.6, 0.6),
        vy: rand(-0.2, 0.2),
        t: rand(0, Math.PI*2)
      });
    }
  }
}

function drawBackground(scene){
  if(scene==="forest"){
    ctx.fillStyle = "#eaf7ea";
    ctx.fillRect(0,0,canvas.width,canvas.height);
    // trees
    for(let i=0;i<18;i++){
      const x = i*60 + 20;
      ctx.fillStyle="#2f7a3b";
      ctx.beginPath();
      ctx.arc(x, 220, 18, 0, Math.PI*2);
      ctx.fill();
    }
    // ground
    ctx.fillStyle="#bfe6bf";
    ctx