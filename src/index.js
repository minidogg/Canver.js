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
    this.tick = { tickFuncs: [], interval: 1000 / 30 }

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
    this.x = 0
    this.y = 0
    this.width = 10
    this.height = 10
    this.color = "lime"
    this.onRenderFuncs = []
    this.sizer = "min"
    this.sizerVal = 0
    this.anchor = 0.5
    this.canver = undefined
    this.renderData = { x: 0, y: 0, w: 0, h: 0 } //where we store the data calculated by the render function so that the other code can interact with it

    Object.keys(options).forEach(e => {
      this[e] = options[e]
    })
  }
  add(c) {
    this.canver = c
    c.scene.push(this)
    return this
  }
  remove(c = this.canver) {
    c.scene.splice(c.scene.indexOf(this), 1)
  }
  render({ ctx, min, canvas, max }) {
    let { w, h, y, x } = { x: 0, y: 0, w: 0, h: 0 }
    if (this.sizer == "relative") {
      w = this.width / 100 * this.canver.c.width
      h = this.height / 100 * this.canver.c.height
      y = this.y / 100 * canvas.height
      x = this.x / 100 * canvas.width
    } else {
      this.sizerVal = this.sizer == "max" ? max : min
      w = this.width / 100 * this.sizerVal
      h = this.height / 100 * this.sizerVal
      y = this.y / 100 * canvas.height
      x = this.x / 100 * canvas.width
    }
    ctx.fillStyle = this.color
    ctx.fillRect(x - (w * this.anchor), y - (h * this.anchor), w, h)
    this.onRenderFuncs.forEach(e => {
      e({ ctx: ctx, min: min, canvas: canvas })
    })
  }

  isColliding(obj) {
    return (
      this.x < obj.x + obj.width &&
      this.x + this.width > obj.x &&
      this.y < obj.y + obj.height &&
      this.y + this.height > obj.y
    );
  }

  touchingEdge() {
    let { w, h, x, y } = this.renderData

    return (
      x < 0 ||
      y < 0 ||
      x + w > this.canver.c.width ||
      y + h > this.canver.c.height
    );
  }
}

//dumby object
Canver.dumby = class extends Canver.gameObject {
  constructor(options) {
    super(options)
  }
  render({ ctx, min, canvas, max }) {
    this.onRenderFuncs.forEach(e => {
      e({ ctx, min, canvas, max })
    })
  }
}

//sprite class
Canver.sprite = class extends Canver.gameObject {
  registerImg(url) {
    this.img = new Image()
    this.img.src = url
    return this
  }
  render({ ctx, min, canvas, max }) {

    let { w, h, y, x } = { x: 0, y: 0, w: 0, h: 0 }
    if (this.sizer == "relative") {
      w = this.width / 100 * canvas.width
      h = this.height / 100 * canvas.height
      y = this.y / 100 * canvas.height
      x = this.x / 100 * canvas.width
    } else {
      this.sizerVal = this.sizer == "max" ? max : min
      w = this.width / 100 * this.sizerVal
      h = this.height / 100 * this.sizerVal
      y = this.y / 100 * canvas.height
      x = this.x / 100 * canvas.width
    }
    ctx.fillStyle = this.color
    this.renderData = { w, h, x, y }
    ctx.drawImage(this.img, x - (w * this.anchor), y - (h * this.anchor), w, h)
    this.onRenderFuncs.forEach(e => {
      e({ ctx: ctx, min: min, canvas: canvas })
    })
  }

}

///text class
Canver.text = class extends Canver.gameObject {
  constructor(options) {
    super()
    this.text = "Hello, World!"
    this.font = "Arial"
    this.fontSize = 3
    this.sizerVal = "max"
    this.x = 50
    this.y = 5
    this.color = "black"
    this.textAlign = "left"

    Object.keys(options).forEach(e => {
      this[e] = options[e]
    })
  }

  render({ ctx, min, canvas, max }) {
    let { w, h, y, x } = { x: 0, y: 0, w: 0, h: 0 }

    this.sizerVal = this.sizer == "max" ? max : min
    w = this.width / 100 * this.sizerVal
    y = this.y / 100 * canvas.height
    x = this.x / 100 * canvas.width

    ctx.font = this.fontSize + "v" + this.sizer + " " + this.font
    ctx.fillStyle = this.color
    ctx.textAlign = this.textAlign
    ctx.fillText(this.text, x - (w * this.anchor), y - (h * this.anchor));
  }
}
