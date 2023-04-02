import Engine, { EngineConfig, EngineInput, EngineRender, RenderObject, TileMapMapping } from "./engine.js"

import map_01 from "./maps/map_01.json";
import mapping from "./tilemapping.json";
const tmapping = mapping as TileMapMapping

const gameConfig:EngineConfig = {
    functions: {
        ready: (render) => ready(render),
        update: (render,input) => update(render,input)
    }
}

//let map_01 = {}


const eng = new Engine()
window.onload = async () => {
    // Experimantal way to import tilemaps (Does not work)
    //map_01 = await (await fetch("./assets/maps/map_01.json")).json()
    
    const canvasElement: HTMLCanvasElement = (document.getElementById("game") as HTMLCanvasElement);
    const ctx = canvasElement.getContext("2d");
    
    if (ctx != null) {
        eng.init(ctx, gameConfig) 
    } else {
        alert("No canvas")
    } 
    
    
}

// Game
let player = (eng.object.createRect("player",0,0,50,50,"white") as RenderObject)

const player_speed = 5

// eng.world.createRect("f1",0,450,200,100,"green")
// eng.world.createRect("f2",200,350,280,50,"green")
// eng.world.createRect("f3",400,450,400,100,"green")
// eng.world.createRect("f4",800,350,280,50,"green")
// eng.world.createRect("mainf",-200,700,1500,50,"red")
// eng.world.createRect("f5",-200,600,100,25,"blue")
let bg = new Image()
bg.src = "./assets/bg/Brown.png"
let tiles = new Image()
tiles.src = "./assets/tiles.png"

let playerch = new Image()
playerch.src = "./assets/player/idle.png"

const ready = (canvas: EngineRender) => {
    console.log("ready");
    canvas.fillRect(1,1,50,50,"black")

    map_01.layers.forEach((layer) => {
        if (layer.objects && layer.class == "coll") {
            layer.objects.forEach((coll)=> {
                eng.world.createRect(coll.id.toString(),coll.x*2,coll.y*2,coll.width*2,coll.height*2,"transparent", {obj:coll.type})
            })
        }
    })
}

//let blackframe = 0

let grav = 1
var pvel = {x:0,y:0}
let onground = false
let tiledpos = {x:0,y:0}
const update = (render:EngineRender,input:EngineInput) => {
    
    

    


    
    pvel.x = 0
    
    if (pvel.y > 1) onground = false

    input.keys.forEach(key => {
        if (key === "ArrowUp" && onground) {onground = false ;pvel.y = -20}
        // if (key === "ArrowDown") pvel.y = player_speed
        if (key === "ArrowLeft") pvel.x = -player_speed
        if (key === "ArrowRight") pvel.x = player_speed
    });

    player.x += pvel.x
    player.y += pvel.y
    
    pvel.y += grav
    Object.keys(eng.world.list).forEach((key) => {
        let obj = eng.world.getObject(key)
        let cl = eng.collisions.advancedrect(player,obj)
        
        //let sensitivity = 0
        if (cl.side =="up" && pvel.y <= 0 && obj.extra?.obj != "platform") {
            player.y += cl.depth
            pvel.y = 0
        }
        if (cl.side =="down" && pvel.y >= 0) {
            onground = true
            player.y += cl.depth
            pvel.y = 0
            
            
        } else {
            
        }
        if (cl.side == "left" && pvel.x <= 0) {
            player.x += cl.depth
        }
        if (cl.side =="right" && pvel.x >= 0) {
            player.x += cl.depth
        }
        
    }
    )

    if (player.x < 150) {
        player.x = 150
        eng.world.moveWorld(-pvel.x,0)
        tiledpos.x -= pvel.x/32
    } 

    if (player.x +player.w > 350) {
        player.x  = 350-player.w
        eng.world.moveWorld(-pvel.x,0)
        tiledpos.x -= pvel.x/32
    }

    if (player.y < 100) {
        player.y = 100
        eng.world.moveWorld(0,-pvel.y)
        tiledpos.y -= pvel.y/32
    } 

    if (player.y + player.h > 400) {
        player.y  = 400-player.h
        eng.world.moveWorld(0,-pvel.y)
        tiledpos.y -= pvel.y/32
    } 
    

    if (pvel.y > 15) {
        pvel.y = 15
    }
    
    



    render.fillRect(0,0,render.canvas.width, render.canvas.height,"black")
    
    for (let i = -1; i < 6;i++) {
        for (let j = -1; j < 6;j++) {
            let xoff = Math.floor(wrapInRange(tiledpos.x,100))
            let yoff =  Math.floor(wrapInRange(tiledpos.y,100))
            render.drawImage((i*100) + xoff,(j*100) + yoff,100,100,bg)
        }
        
    }
    

    //tilemap size 22
    
    

    
    
    const loadchunk = (chunk: {data: number[]; height: number; width: number; x: number; y: number;}) => {
        chunk.data.forEach((tile,position)=> {
            if (tile > 0) {
                const x = position % 16;
                const y = Math.floor(position / 16);
                let tileimgpos = {x:0,y:0}
                if (tmapping[tile]) {
                    tileimgpos = {x: tmapping[tile][0], y: tmapping[tile][1]};
                } else {
                    console.error("Tile '" + tile + "' is not defined in mapping");
                    
                }

                render.tile(
                    x + chunk.x + tiledpos.x,
                    y + chunk.y + tiledpos.y,
                    tileimgpos.x,
                    tileimgpos.y,
                    16,
                    tiles
                )
            }
            
        }) 
    }


    map_01.layers.forEach((layer) => {
        
        if (layer.chunks) {
            layer.chunks.forEach((chunk) => {
                if (-tiledpos.x > chunk.x - 16 && -tiledpos.x < chunk.x + 32) {
                    if (-tiledpos.y > chunk.y - 16 && -tiledpos.y < chunk.y + 32) {
                        loadchunk(chunk)
                    }
                }
            })
        }
        
        
    })
    Object.keys(eng.world.list).forEach((key) => {
        let obj = eng.world.getObject(key)
        if (obj.type == "rect"){
            render.objectRect(obj)
        }
    })

    render.objectRect(player)
    // render.drawSpritesheet(player.x,player.y,player.w,player.h,128,0,32,32,playerch)
}

function wrapInRange(value: number,limit: number): number {
    const rangeLength = limit; // the length of the range, including 0 and 22
    const wrappedValue = ((value % rangeLength) + rangeLength) % rangeLength; // wrap the value within the range
    return wrappedValue;
}
     
        

// const input = (canvas: CanvasRenderingContext2D, event: KeyboardEvent) => {
//     console.log(event.key);
    
// }
