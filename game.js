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
    ctx.fillRect(0,320,canvas.width,130);
  } else if(scene==="city"){
    ctx.fillStyle="#eef2ff";
    ctx.fillRect(0,0,canvas.width,canvas.height);
    // buildings
    for(let i=0;i<12;i++){
      const x = i*75;
      const h = 80 + (i%3)*40;
      ctx.fillStyle="#9aa7c6";
      ctx.fillRect(x+10, 320-h, 55, h);
    }
    // road
    ctx.fillStyle="#c9d1e6";
    ctx.fillRect(0,320,canvas.width,130);
    ctx.strokeStyle="#ffffff";
    ctx.setLineDash([10, 12]);
    ctx.beginPath();
    ctx.moveTo(0, 385);
    ctx.lineTo(canvas.width, 385);
    ctx.stroke();
    ctx.setLineDash([]);
  } else {
    ctx.fillStyle = "#e6fbff";
    ctx.fillRect(0,0,canvas.width,canvas.height);
    // waves
    ctx.strokeStyle="#7ed3e6";
    for(let y=260;y<330;y+=12){
      ctx.beginPath();
      for(let x=0;x<=canvas.width;x+=30){
        ctx.lineTo(x, y + Math.sin(x/60)*4);
      }
      ctx.stroke();
    }
    // beach
    ctx.fillStyle="#ffe8b6";
    ctx.fillRect(0,320,canvas.width,130);
  }
}

function drawIcon(p){
  // ドットっぽい簡易アイコン（色と形だけ）
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.fillStyle = "#222";

  const type = p.type;
  if(type==="bird" || type==="seagull"){
    ctx.fillStyle = "#111";
    ctx.fillRect(-4,-2,8,4);
    ctx.fillRect(-8,-6,4,2);
    ctx.fillRect(4,-6,4,2);
  } else if(type==="car"){
    ctx.fillStyle="#1b3a8a";
    ctx.fillRect(-8,-4,16,8);
    ctx.fillStyle="#111";
    ctx.fillRect(-6,4,4,3);
    ctx.fillRect(2,4,4,3);
  } else if(type==="water"){
    ctx.fillStyle="#147aa6";
    ctx.fillRect(-5,-5,10,10);
  } else if(type==="rain"){
    ctx.fillStyle="#3b82f6";
    ctx.fillRect(-1,-6,2,8);
  } else if(type==="wind"){
    ctx.fillStyle="#16a34a";
    ctx.fillRect(-7,-2,14,2);
    ctx.fillRect(-5,2,10,2);
  } else if(type==="speech"){
    ctx.fillStyle="#6b7280";
    ctx.fillRect(-5,-5,10,10);
    ctx.fillRect(-2,5,4,3);
  } else {
    ctx.fillStyle="#111";
    ctx.fillRect(-4,-4,8,8);
  }

  ctx.restore();
}

function tick(){
  if(!world){ requestAnimationFrame(tick); return; }

  drawBackground(world.scene);

  // update
  for(const p of particles){
    p.t += 0.03;
    p.x += p.vx + Math.sin(p.t)*0.2;
    p.y += p.vy;

    if(p.y < 40) p.y = 40;
    if(p.y > 300) p.y = 300;
    if(p.x < 10) p.x = canvas.width-10;
    if(p.x > canvas.width-10) p.x = 10;

    // 車は地面付近を走らせる
    if(p.type==="car"){
      p.y = 360;
      p.x += 1.2;
      if(p.x > canvas.width+10) p.x = -10;
    }
    // 雨は落ちる
    if(p.type==="rain"){
      p.y += 2.0;
      if(p.y > 310) p.y = 60;
    }
  }

  // draw particles
  for(const p of particles){
    drawIcon(p);
  }

  requestAnimationFrame(tick);
}

document.getElementById("analyzeBtn").addEventListener("click", async ()=>{
  // 今はダミー
  const w = makeWorldFromDummy(preset.value);
  applyWorld(w);
});

applyWorld(makeWorldFromDummy("forest"));
tick();