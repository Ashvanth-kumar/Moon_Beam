console.log(gsap)

// get the inner pallete for the game
const canva=document.querySelector("canvas")
// set the default height and width of the window 
canva.height=innerHeight
canva.width=innerWidth
 
//select the context of the canvas to make it as a 2d 
//canva context is basically the api we work on 

const ctx=canva.getContext("2d")

const score= document.getElementById("Score")
//create the class player 
const st=document.getElementById("strt")

const st_board=document.getElementById("startboard")

const final_score=document.getElementById("final_score")


class Player{
    constructor(x,y,r,clr){
        this.x=x
        this.y=y
        this.radius=r
        this.colour=clr   
    }

    draw() {
        ctx.beginPath()
        ctx.arc(this.x,this.y,this.radius,0,Math.PI*2,true);
        ctx.fillStyle=this.colour  
        ctx.fill()
    }
}

// place the player in center of the webpage 
const x = canva.width/2
const y = canva.height/2

let player1=new Player(x,y,25,"white")
player1.draw()


//create a class bullet 

class Bullet{
    constructor(x,y,r,clr,velocity){
        this.x=x
        this.y=y
        this.radius=r
        this.colour=clr
        this.velocity=velocity
        //shoot()
    }
    draw() {
        ctx.beginPath()
        ctx.arc(this.x,this.y,this.radius,0,Math.PI*2,true);
        ctx.fillStyle=this.colour  
        ctx.fill()
    }
    update(){
        this.draw() 
        this.x=this.x + this.velocity.x
        this.y= this.y + this.velocity.y
    }  
}


// particle 
const friction =0.99
class Particle{
    constructor(x,y,r,clr,velocity){
        this.x=x
        this.y=y
        this.radius=r
        this.colour=clr
        this.velocity=velocity
        this.alpha = 1
        //shoot()
    }
    draw() {
        ctx.save()
        ctx.globalAlpha = this.alpha 
        ctx.beginPath()
        ctx.arc(this.x,this.y,this.radius,0,Math.PI*2,true);
        ctx.fillStyle=this.colour  
        ctx.fill()
        ctx.restore()
    }
    update(){
        this.draw() 
        this.velocity.x *= friction
        this.velocity.y *= friction
        this.x=this.x + this.velocity.x
        this.y= this.y + this.velocity.y
        this.alpha -= 0.009
    }  
}

//to animate over and over again

let bullets = [] // we need to project many bullets so push we create them in run time and push it into array
let asteroids=[]
let particles = []


function init(){
    points=0
    player1=new Player(x,y,25,"white")
    bullets = [] // we need to project many bullets so push we create them in run time and push it into array
    asteroids=[]
    particles = []
    score.innerHTML=points
    
}

let shootId
let points=0
function shoot() {
    shootId = requestAnimationFrame(shoot)

    ctx.fillStyle="rgba(0,0,0,0.1)"
    ctx.fillRect(0,0,canva.width,canva.height)//since old bullet remains in the page we clear the web 
    player1.draw()// draw the player after the clearing of page 

    particles.forEach((Particle, indx) => {
        if (Particle.alpha <= 0 ){
            particles.splice(indx,1)
        }else{
            Particle.update()
        }
    });
    bullets.forEach((Bullet,Index) => {
        Bullet.update()//update the bullet 
        // 
        if (Bullet.x + Bullet.radius < 0 ||
            Bullet.y + Bullet.radius <0 ||
            Bullet.x - Bullet.radius > canva.width ||
            Bullet.y - Bullet.radius > canva.height 
        ){
            setTimeout(()=>{
                bullets.splice(Index,1)
            },0)
        }
    })

    asteroids.forEach((Asteroid , Index )=>{
        Asteroid.update()

        const hitdist = Math.hypot(Asteroid.x - player1.x,Asteroid.y - player1.y)
        //end game !!!!
        if (hitdist-Asteroid.radius-player1.radius< 1 ){
            cancelAnimationFrame(shootId)
            final_score.innerHTML = points 
            st_board.style.display="flex"
        }
        bullets.forEach((Bullet,bulletIndex)=>{
            //calculate distance 
            const dist = Math.hypot(Bullet.x - Asteroid.x, Bullet.y - Asteroid.y)
            // if distance is zero elminate 
            if (dist - Asteroid.radius - Bullet.radius < 1 ){
                
                //scatter effect 
                
                for (let i = 0 ; i < Asteroid.radius *2 ; i++){
                    particles.push(
                        new Particle(Bullet.x,Bullet.y,Math.random() * 2,Asteroid.colour,{
                            x:(Math.random()-0.5) * (Math.random()*6),
                            y:(Math.random()-0.5) * (Math.random()*6)
                        })
                    )
                }  
                
                if (Asteroid.radius-10 > 10 ){

                    points +=100
                    score.innerHTML = points
                    gsap.to(Asteroid,{
                        radius:Asteroid.radius - 15
                    })
                    setTimeout(()=>{
                        bullets.splice( bulletIndex ,1 )
                    },0)
                }
                else{

                    points +=175
                    document.getElementById("Score").innerHTML = points
                    setTimeout(()=>{
                        bullets.splice( bulletIndex ,1 )
                        asteroids.splice(Index , 1)
                    },0)
                }
            }
        })
    })
}

//create a window event listener
window.addEventListener(`click`,(event)=>{ 
    
    const angle=Math.atan2(event.clientX - canva.width/2,
        event.clientY - canva.height/2)
        
    const velocity = {
        x : Math.sin(angle) * 2.5,
        y : Math.cos(angle) * 2.5
    }
    bullets.push(new Bullet(canva.width/2,canva.height/2,10,player1.colour,velocity))

})        

// enemies
class Asteroid{
    constructor(x,y,r,clr,velocity){
        this.x=x
        this.y=y
        this.radius=r
        this.colour=clr
        this.velocity=velocity
        //shoot()
    }
    draw() {
        ctx.beginPath()
        ctx.arc(this.x,this.y,this.radius,0,Math.PI*2,true);
        ctx.fillStyle=this.colour  
        ctx.fill()
    }
    update(){
        this.draw() 
        this.x=this.x + this.velocity.x
        this.y= this.y + this.velocity.y
    }  
}
// to spawn enemies 
 
function spawnAsteroids (){
    setInterval(()=>{
        const radius= Math.random() * (40 - 10 )  + 10 
        let x 
        let y
        if (Math.random()<.5){
            x= Math.random()<.5 ? 0 - radius : canva.width + radius
            y = Math.random() * canva.height
        }
        else {
            x = Math.random() * canva.width
            y = Math.random()<.5 ? 0 - radius : canva.height + radius
        }

        const angle=Math.atan2(canva.height/2 - y , canva.width/2- x )
        const velocity={
            x : Math.cos(angle)*.75,
            y : Math.sin(angle)*.75
        }
        let clr = `hsl(${Math.random() * 360}, 50%, 50%)`;
        asteroids.push(new Asteroid(x,y,radius,clr,velocity))
        //console.log(asteroids)
    },1700)
}

st.addEventListener("click",()=>{
    init()
    shoot()
    spawnAsteroids()
    st_board.style.display="none"
})
