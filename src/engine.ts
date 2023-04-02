
// type EngineConfig = {
    
// }

export interface RenderObject{
    type: string,
    x: number,
    y: number,
    w: number,
    h: number,
    color: string | CanvasGradient | CanvasPattern
}


export interface EngineRender {
    fillRect: (x: number,y: number,w: number,h: number, color:string | CanvasGradient | CanvasPattern) => void,
    tile: (x: number,y: number,tileX: number,tileY: number, size:number,tileimage: HTMLImageElement) => void,
    objectRect: (object:RenderObject) => void,
    canvas: {width: number, height: number}
}

export interface EngineInput {
    keys: string[]
}


export interface EngineConfig {
    functions: {
        ready: (render:EngineRender) => void,
        update: (render:EngineRender, input:EngineInput) => void,
    }
}


export default class Engine {
    private canvas!: CanvasRenderingContext2D
    private config!: EngineConfig;
    private objects: { [index: string]: RenderObject;} = {}
    private worlddata: {x:number,y:number,objects:{[index: string]: RenderObject;}} = {x:0,y:0,objects:{}}

    init = (canvas: CanvasRenderingContext2D, config: EngineConfig) => {
        this.canvas = canvas
        this.config = config
        this.canvas.imageSmoothingEnabled = false


        const render:EngineRender = {
            fillRect: (x: number,y: number,w: number,h: number, color:string | CanvasGradient | CanvasPattern) => {
                this.canvas.fillStyle = color
                this.canvas.fillRect(x,y,w,h)
            },
            tile: (x: number,y: number,tileX: number,tileY: number, size:number,tileimage: HTMLImageElement) => {
                this.canvas.drawImage(tileimage,tileX,tileY,size,size,x*(size*2),y*(size*2),size*2,size*2)
            },
            objectRect: (object:RenderObject) => {
                this.canvas.fillStyle = object.color
                this.canvas.fillRect(object.x,object.y,object.w,object.h)
            },
            canvas: {
                width: this.canvas.canvas.width,
                height: this.canvas.canvas.height
            },
        }

        
        let input_data: string[] = inputhandler()
        



        this.config.functions.ready(render)
        
        let input:EngineInput = {
            keys: input_data
        }

        window.setInterval(() => { this.config.functions.update(render,input) },13)
        
    }
    // Experimental (RAM killer)
    // Mobilex: Please help me with this. I don't know how to do it.
    /*
    tiled = {
        loadfullTilemap: (position :{x:number,y:number},tilemapimage:HTMLImageElement,tilemapdata: any,tilesize: number) => {
            // loads chunks
            tilemapdata["layers"][0].chunks.forEach((chunk)=> {
                // goes through all tiles in that chunk
                for (let y = 0; y < chunk.height;y++) {
                    for (let x = 0; x < chunk.height;x++) {
                        // some calculations that i tried to do (does not work)
                        let tile = chunk.data[x*(y*16)]
                        tilemapimage.width/tilesize
                        tilemapimage.height/tilesize

                        // render (gets called for every tile. aka: RAM killer)
                        this.canvas.drawImage(
                            tilemapimage,
                            wrapInRange(tile,tilemapimage.width/tilesize),
                            Math.floor(tile/(tilemapimage.width/tilesize)),
                            tilesize,
                            tilesize,
                            x*(tilesize*2)
                            ,y*(tilesize*2)
                            ,tilesize*2,
                            tilesize*2)
                        console.log(tile)
                    }
                }

            })
            
        }  
    }
    */


    object = {
        list: this.objects,
        createRect: (name:string,x:number,y:number,w:number,h:number,color: string | CanvasGradient | CanvasPattern) => {
            if (this.objects[name]) {
                console.error("Name '" + name + "' already exists")
                return null
            } else {
                this.objects[name] = {type:"rect",x,y,w,h,color}
                return this.objects[name]
            }
        },
        removeRect: (name:string) => {
            delete this.objects[name]
        },
        getObject: (name:string) => {
            return this.objects[name]
        }
    }

    world = {
        list: this.worlddata.objects,
        createRect: (name:string,x:number,y:number,w:number,h:number,color: string | CanvasGradient | CanvasPattern) => {
            if (this.worlddata.objects[name]) {
                console.error("Name '" + name + "' already exists")
                return null
            } else {
                this.worlddata.objects[name] = {type:"rect",x,y,w,h,color}
                return this.worlddata.objects[name] 
            }
            
        },
        removeRect: (name:string) => {
            delete this.worlddata.objects[name]
        },
        getObject: (name:string) => {
            return this.worlddata.objects[name]
        },

        moveWorld: (x:number,y:number)=>{
            Object.keys(this.worlddata.objects).forEach((key) => {
                let obj = this.worlddata.objects[key]
                obj.x += x
                obj.y += y
            })
        }
    }


    collisions = collisionhandler



}

// // Commented so TS compiler does not complain
// function wrapInRange(value: number,limit: number): number {
//     const rangeLength = limit; // the length of the range, including 0 and 22
//     const wrappedValue = ((value % rangeLength) + rangeLength) % rangeLength; // wrap the value within the range
//     return wrappedValue;
//   }
 





const collisionhandler = {
    simplerect: (object1:RenderObject,object2:RenderObject):boolean => {
        if ((object1.x + object1.w) > object2.x && object1.x < (object2.x + object2.w)) {

            if ((object1.y + object1.h) > object2.y && object1.y < (object2.y + object2.h)) return true

        }
        return false
    },

    advancedrect: (object1:RenderObject,object2:RenderObject):{side: string,depth:number} => {
        // left/right detection
        if ((object1.x + object1.w) > object2.x && object1.x < (object2.x + object2.w)) {
            // top/down detection
            if ((object1.y + object1.h) > object2.y && object1.y < (object2.y + object2.h)) {
                // side detection (bigger wins)


                return collsidetetect(
                    object1.x,object1.y,object1.w,object1.h,
                    object2.x,object2.y,object2.w,object2.h
                    );

            }
            
        }
        return {side: "none",depth: 0}
    }

}




const collsidetetect = (x1:number,y1:number,w1:number,h1:number,x2:number,y2:number,w2:number,h2:number):{side: string,depth:number} => {
    // Modified version of:
    // https://stackoverflow.com/questions/56606799/how-to-detect-the-side-on-which-collision-occured

    let object1_Half = { x: (w1 /2), y: (h1 /2)}
    let object2_Half = { x: (w2 /2), y: (h2 /2)}

    let object1_center = { x: (x1 + w1/2), y: (y1 + h1/2)}

    let object2_center = { x: (x2 + w2/2), y: (y2 + h2/2)}

    let diff = {
        x: object1_center.x - object2_center.x,
        y: object1_center.y - object2_center.y
    }

    let minDist = {
        x: object1_Half.x + object2_Half.x,
        y: object1_Half.y + object2_Half.y
    }

    let depth = {
        x: diff.x > 0 ? minDist.x - diff.x : -minDist.x - diff.x,
        y: diff.y > 0 ? minDist.y - diff.y : -minDist.y - diff.y,
    }

    if(depth.x != 0 && depth.y != 0){
        if(Math.abs(depth.x) < Math.abs(depth.y)){
          // Collision along the X axis. React accordingly
          if(depth.x > 0){
            return {side: "left",depth: depth.x}
              
          }
          else{
                return {side: "right",depth: depth.x}
          }
        }
        else{
          // Collision along the Y axis.
          if(depth.y > 0){
                return {side: "up",depth: depth.y}
          }
          else{
                return {side: "down",depth: depth.y}
          }
        }
      }
    return {side: "none",depth: 0}
}




const inputhandler = () => {
    let input_data: string[] = []
    window.onkeydown= (egin) => {
        if (input_data.indexOf(egin.key) === -1) {
            input_data.push(egin.key)
        }
    }

    window.onkeyup= (egin) => {

        const index = input_data.indexOf(egin.key);
        if (index > -1) { // only splice array when item is found
            input_data.splice(index, 1); // 2nd parameter means remove one item only
        }
    }
    return input_data
}

// // Might add in future
// const renderhandler = {

// }
