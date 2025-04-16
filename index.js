console.log(gsap)

const canva = document.querySelector("canvas")
canva.height = innerHeight
canva.width = innerWidth

const ctx = canva.getContext("2d")

const score = document.getElementById("Score")
const st = document.getElementById("strt")
const st_board = document.getElementById("startboard")
const final_score = document.getElementById("final_score")

class Player {
    constructor(x, y, r, clr) {
        this.x = x
        this.y = y
        this.radius = r
        this.colour = clr
    }
    draw() {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true)
        ctx.fillStyle = this.colour
        ctx.fill()
    }
}

const x = canva.width / 2
const y = canva.height / 2
let player1 = new Player(x, y, 25, "white")
player1.draw()

class Bullet {
    constructor(x, y, r, clr, velocity) {
        this.x = x
        this.y = y
        this.radius = r
        this.colour = clr
        this.velocity = velocity
    }
    draw() {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true)
        ctx.fillStyle = this.colour
        ctx.fill()
    }
    update() {
        this.draw()
        this.x += this.velocity.x
        this.y += this.velocity.y
    }
}

const friction = 0.99
class Particle {
    constructor(x, y, r, clr, velocity) {
        this.x = x
        this.y = y
        this.radius = r
        this.colour = clr
        this.velocity = velocity
        this.alpha = 1
    }
    draw() {
        ctx.save()
        ctx.globalAlpha = this.alpha
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true)
        ctx.fillStyle = this.colour
        ctx.fill()
        ctx.restore()
    }
    update() {
        this.draw()
        this.velocity.x *= friction
        this.velocity.y *= friction
        this.x += this.velocity.x
        this.y += this.velocity.y
        this.alpha -= 0.01
    }
}

let bullets = []
let asteroids = []
let particles = []
let shootId
let asteroidIntervalId
let points = 0

function init() {
    points = 0
    player1 = new Player(x, y, 25, "white")

    bullets.length = 0
    asteroids.length = 0
    particles.length = 0

    score.innerHTML = points

    if (asteroidIntervalId) clearInterval(asteroidIntervalId)
    if (shootId) cancelAnimationFrame(shootId)
}

function shoot() {
    shootId = requestAnimationFrame(shoot)

    ctx.fillStyle = "rgba(0,0,0,0.1)"
    ctx.fillRect(0, 0, canva.width, canva.height)

    player1.draw()

    particles.forEach((p, i) => {
        if (p.alpha <= 0) particles.splice(i, 1)
        else p.update()
    })

    bullets.forEach((b, i) => {
        b.update()
        if (b.x + b.radius < 0 || b.y + b.radius < 0 || b.x - b.radius > canva.width || b.y - b.radius > canva.height) {
            bullets.splice(i, 1)
        }
    })

    asteroids.forEach((a, ai) => {
        a.update()

        const hitdist = Math.hypot(a.x - player1.x, a.y - player1.y)
        if (hitdist - a.radius - player1.radius < 1) {
            cancelAnimationFrame(shootId)
            final_score.innerHTML = points
            st_board.style.display = "flex"
        }

        bullets.forEach((b, bi) => {
            const dist = Math.hypot(b.x - a.x, b.y - a.y)
            if (dist - a.radius - b.radius < 1) {
                for (let i = 0; i < a.radius * 2; i++) {
                    particles.push(new Particle(b.x, b.y, Math.random() * 2, a.colour, {
                        x: (Math.random() - 0.5) * (Math.random() * 6),
                        y: (Math.random() - 0.5) * (Math.random() * 6)
                    }))
                }
                if (a.radius - 15 > 10) {
                    points += 100
                    score.innerHTML = points
                    gsap.to(a, { radius: a.radius - 15 })
                    bullets.splice(bi, 1)
                } else {
                    points += 175
                    score.innerHTML = points
                    bullets.splice(bi, 1)
                    asteroids.splice(ai, 1)
                }
            }
        })
    })
}

window.addEventListener("click", (event) => {
    const angle = Math.atan2(event.clientY - canva.height / 2, event.clientX - canva.width / 2)
    const velocity = {
        x: Math.cos(angle) * 2.5,
        y: Math.sin(angle) * 2.5
    }
    bullets.push(new Bullet(canva.width / 2, canva.height / 2, 10, player1.colour, velocity))
})

class Asteroid {
    constructor(x, y, r, clr, velocity) {
        this.x = x
        this.y = y
        this.radius = r
        this.colour = clr
        this.velocity = velocity
    }
    draw() {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true)
        ctx.fillStyle = this.colour
        ctx.fill()
    }
    update() {
        this.draw()
        this.x += this.velocity.x
        this.y += this.velocity.y
    }
}

function spawnAsteroids() {
    asteroidIntervalId = setInterval(() => {
        const radius = Math.random() * (40 - 10) + 10
        let x, y
        if (Math.random() < 0.5) {
            x = Math.random() < 0.5 ? 0 - radius : canva.width + radius
            y = Math.random() * canva.height
        } else {
            x = Math.random() * canva.width
            y = Math.random() < 0.5 ? 0 - radius : canva.height + radius
        }

        const angle = Math.atan2(canva.height / 2 - y, canva.width / 2 - x)
        const velocity = {
            x: Math.cos(angle) * 0.75,
            y: Math.sin(angle) * 0.75
        }
        let clr = `hsl(${Math.random() * 360}, 50%, 50%)`
        asteroids.push(new Asteroid(x, y, radius, clr, velocity))
    }, 1700)
}

st.addEventListener("click", () => {
    init()
    shoot()
    spawnAsteroids()
    st_board.style.display = "none"
})
