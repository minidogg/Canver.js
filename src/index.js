var Canver = {}
Canver.Canver = class {
  constructor(options = {}) {
    this.c = document.createElement('canvas')
    this.ctx = this.c.getContext("2d")
    this.style = document.createElement("style")
    this.scene = []

    this.render = { renderFuncs: [] }
    this.render.min = 0
    this.render.max = 0
    this.tick = { tickFuncs: [], interval: 20 }

    Object.keys(options).forEach(e => {
      this[e] = options[e]
    })


    this.setup()
  }
  resizeToFit() {
    this.c.width = window.innerWidth
    this.c.height = window.innerHeight
    this.render.min = Math.min(this.c.width, this.c.height)
    this.render.max = Math.max(this.c.width, this.c.height)

  }
  setup() {
    //basic setup
    this.style.innerHTML = `
      *{
        margin:0;
      }
      body{
        overflow:hidden;
      }
    `
    this.resizeToFit()

    document.body.appendChild(this.style)
    document.body.appendChild(this.c)

    window.addEventListener("resize", () => {
      this.resizeToFit()
    })


    //render    
    this.render.render = () => {
      this.ctx.clearRect(0, 0, this.c.width, this.c.height)
      this.render.renderFuncs.forEach((e) => {
        e({ ctx: this.ctx, canvas: this.c, canver: this })
      })
    }
    this.tick.tickFuncs.push(this.render.render)
    //base render func
    this.render.renderFuncs.push(({ ctx }) => {
      this.scene.forEach((e) => {
        if (e.render) e.render({ ctx: this.ctx, canvas: this.c, min: this.render.min, max: this.render.max })
      })

    })

    //tick loop
    this.tick.tickLoop = () => {
      this.tick.tickFuncs.forEach((e) => {
        e({ ctx: this.ctx, canvas: this.c, canver: this })
      })

      setTimeout(this.tick.tickLoop, this.tick.interval)
    }
    this.tick.tickLoop()

  }

}

//game object base
Canver.gameObject = class {
  constructor(options = {}) {
    this.type = "gameObject"
    this.x = 95
    this.y = 50
    this.width = 10
    this.height = 10
    this.color = "black"
    this.onRenderFuncs = []
    this.sizer = "max"
    this.sizerVal = 0
    this.anchor = 0.5

    Object.keys(options).forEach(e => {
      this[e] = options[e]
    })
  }
  add(c) {
    c.scene.push(this)
    return this
  }
  render({ ctx, min, canvas, max }) {
    this.sizerVal = this.sizer == "max" ? max : min
    ctx.fillStyle = this.color
    let w = this.width / 100 * this.sizerVal
    let h = this.height / 100 * this.sizerVal
    let y = this.y / 100 * canvas.height
    let x = this.x / 100 * canvas.width
    ctx.fillRect(x - (w * this.anchor), y - (h * this.anchor), w, h)
    this.onRenderFuncs.forEach(e => {
      e({ ctx: ctx, min: min, canvas: canvas })
    })
  }

}
