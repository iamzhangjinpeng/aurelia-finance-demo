import {
  AdditiveBlending,
  ClampToEdgeWrapping,
  FloatType,
  HalfFloatType,
  LinearFilter,
  RGBAFormat,
  BufferAttribute,
  BufferGeometry,
  Camera,
  Clock,
  Color,
  DataTexture,
  LineSegments,
  Mesh,
  PlaneGeometry,
  RawShaderMaterial,
  Scene,
  Vector2,
  Vector4,
  WebGLRenderTarget,
  WebGLRenderer,
} from 'three'

// Original fluid simulation, retained with its shader settings and palette.
// Shader strings, numerical passes, palette, input scaling, and defaults are
// preserved. This module uses the same Three.js revision (r128) as that page.
export function initLiquidEther(container, onUnavailable = () => {}) {
  // Keep the reference solver in JavaScript so its shaders and numerical passes
  // remain directly comparable. Only ownership/lifecycle integration is added.
  const cleanups = []
  const scenes = new Set()
  const renderTargets = new Set()
  let renderer
  let disposed = false
  const listen = (target, type, handler, options) => {
    target.addEventListener(type, handler, options)
    cleanups.push(() => target.removeEventListener(type, handler, options))
  }
  const dispose = () => {
    if (disposed) return
    disposed = true
    cleanups.reverse().forEach((cleanup) => cleanup())
    const geometries = new Set()
    const materials = new Set()
    scenes.forEach((scene) =>
      scene.traverse((object) => {
        if (object.geometry) geometries.add(object.geometry)
        if (object.material) {
          ;(Array.isArray(object.material) ? object.material : [object.material]).forEach(
            (material) => materials.add(material),
          )
        }
      }),
    )
    geometries.forEach((geometry) => geometry.dispose())
    materials.forEach((material) => material.dispose())
    renderTargets.forEach((target) => target.dispose())
    if (renderer) {
      renderer.dispose()
      renderer.forceContextLoss()
      renderer.domElement.remove()
    }
  }
  try {
    const COLORS = ['#4600F9', '#BA71FE']

    function makePaletteTexture(stops) {
      const arr = stops.length === 1 ? [stops[0], stops[0]] : stops
      const w = arr.length
      const data = new Uint8Array(w * 4)
      for (let i = 0; i < w; i++) {
        const c = new Color(arr[i])
        data[i * 4] = Math.round(c.r * 255)
        data[i * 4 + 1] = Math.round(c.g * 255)
        data[i * 4 + 2] = Math.round(c.b * 255)
        data[i * 4 + 3] = 255
      }
      const tex = new DataTexture(data, w, 1, RGBAFormat)
      tex.magFilter = LinearFilter
      tex.minFilter = LinearFilter
      tex.wrapS = ClampToEdgeWrapping
      tex.wrapT = ClampToEdgeWrapping
      tex.generateMipmaps = false
      tex.needsUpdate = true
      return tex
    }

    const paletteTex = makePaletteTexture(COLORS)
    cleanups.push(() => paletteTex.dispose())
    const bgVec4 = new Vector4(1, 1, 1, 1) // Light-theme background

    const Common = {
      width: 0,
      height: 0,
      aspect: 1,
      pixelRatio: 1,
      fboWidth: null,
      fboHeight: null,
      time: 0,
      delta: 0,
      container: null,
      renderer: null,
      clock: null,
      init(container) {
        this.container = container
        this.pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
        this.resize()
        this.renderer = new WebGLRenderer({ antialias: true, alpha: true })
        renderer = this.renderer
        this.renderer.autoClear = false
        this.renderer.setClearColor(new Color(0xffffff), 1)
        this.renderer.setPixelRatio(this.pixelRatio)
        this.renderer.setSize(this.width, this.height)
        this.renderer.domElement.style.width = '100%'
        this.renderer.domElement.style.height = '100%'
        this.renderer.domElement.style.display = 'block'
        this.clock = new Clock()
        this.clock.start()
      },
      resize() {
        if (!this.container) return
        const rect = this.container.getBoundingClientRect()
        this.width = Math.max(1, Math.floor(rect.width))
        this.height = Math.max(1, Math.floor(rect.height))
        this.aspect = this.width / this.height
        if (this.renderer) this.renderer.setSize(this.width, this.height, false)
      },
      update() {
        this.delta = this.clock.getDelta()
        this.time += this.delta
      },
    }

    const Mouse = {
      coords: new Vector2(),
      coords_old: new Vector2(),
      diff: new Vector2(),
      container: null,
      isHoverInside: false,
      isAutoActive: false,
      autoIntensity: 2.2,
      takeoverActive: false,
      takeoverStartTime: 0,
      takeoverDuration: 0.25,
      takeoverFrom: new Vector2(),
      takeoverTo: new Vector2(),
      lastUserInteraction: 0,
      init(container) {
        this.container = container
        listen(window, 'mousemove', (e) => this.onMouseMove(e), { passive: true })
        listen(window, 'touchstart', (e) => this.onTouchStart(e), { passive: true })
        listen(window, 'touchmove', (e) => this.onTouchMove(e), { passive: true })
      },
      isPointInside(x, y) {
        if (!this.container) return false
        const r = this.container.getBoundingClientRect()
        return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom
      },
      setCoords(x, y) {
        if (!this.container) return
        const r = this.container.getBoundingClientRect()
        if (r.width === 0 || r.height === 0) return
        const nx = (x - r.left) / r.width
        const ny = (y - r.top) / r.height
        this.coords.set(nx * 2 - 1, -(ny * 2 - 1))
      },
      setNormalized(nx, ny) {
        this.coords.set(nx, ny)
      },
      onMouseMove(e) {
        if (!this.isPointInside(e.clientX, e.clientY)) return
        this.lastUserInteraction = performance.now()
        this.setCoords(e.clientX, e.clientY)
      },
      onTouchStart(e) {
        if (e.touches.length !== 1) return
        const t = e.touches[0]
        if (!this.isPointInside(t.clientX, t.clientY)) return
        this.lastUserInteraction = performance.now()
        this.setCoords(t.clientX, t.clientY)
      },
      onTouchMove(e) {
        if (e.touches.length !== 1) return
        const t = e.touches[0]
        if (!this.isPointInside(t.clientX, t.clientY)) return
        this.lastUserInteraction = performance.now()
        this.setCoords(t.clientX, t.clientY)
      },
      update() {
        this.diff.subVectors(this.coords, this.coords_old)
        this.coords_old.copy(this.coords)
        if (this.isAutoActive) this.diff.multiplyScalar(this.autoIntensity)
      },
    }

    // AutoDriver
    const AutoDriver = {
      mouse: null,
      manager: null,
      enabled: true,
      speed: 0.5,
      resumeDelay: 1000,
      rampDurationMs: 600,
      active: false,
      current: new Vector2(0, 0),
      target: new Vector2(),
      lastTime: 0,
      activationTime: 0,
      margin: 0.2,
      _tmp: new Vector2(),
      init(mouse, manager) {
        this.mouse = mouse
        this.manager = manager
        this.pickNewTarget()
      },
      pickNewTarget() {
        this.target.set(
          (Math.random() * 2 - 1) * (1 - this.margin),
          (Math.random() * 2 - 1) * (1 - this.margin),
        )
      },
      forceStop() {
        this.active = false
        this.mouse.isAutoActive = false
      },
      update() {
        if (!this.enabled) return
        const now = performance.now()
        const idle = now - this.manager.lastUserInteraction
        if (idle < this.resumeDelay) {
          if (this.active) this.forceStop()
          return
        }
        if (!this.active) {
          this.active = true
          this.current.copy(this.mouse.coords)
          this.lastTime = now
          this.activationTime = now
        }
        this.mouse.isAutoActive = true
        let dtSec = (now - this.lastTime) / 1000
        this.lastTime = now
        if (dtSec > 0.2) dtSec = 0.016
        this._tmp.subVectors(this.target, this.current)
        const dist = this._tmp.length()
        if (dist < 0.01) {
          this.pickNewTarget()
          return
        }
        this._tmp.normalize()
        let ramp = 1
        if (this.rampDurationMs > 0) {
          const t = Math.min(1, (now - this.activationTime) / this.rampDurationMs)
          ramp = t * t * (3 - 2 * t)
        }
        const move = Math.min(this.speed * dtSec * ramp, dist)
        this.current.addScaledVector(this._tmp, move)
        this.mouse.setNormalized(this.current.x, this.current.y)
      },
    }

    // Shaders
    const face_vert = `attribute vec3 position; uniform vec2 px; uniform vec2 boundarySpace; varying vec2 uv; precision highp float; void main(){ vec3 pos = position; vec2 scale = 1.0 - boundarySpace * 2.0; pos.xy = pos.xy * scale; uv = vec2(0.5)+(pos.xy)*0.5; gl_Position = vec4(pos, 1.0); }`
    const line_vert = `attribute vec3 position; uniform vec2 px; precision highp float; varying vec2 uv; void main(){ vec3 pos = position; uv = 0.5 + pos.xy * 0.5; vec2 n = sign(pos.xy); pos.xy = abs(pos.xy) - px * 1.0; pos.xy *= n; gl_Position = vec4(pos, 1.0); }`
    const mouse_vert = `precision highp float; attribute vec3 position; attribute vec2 uv; uniform vec2 center; uniform vec2 scale; uniform vec2 px; varying vec2 vUv; void main(){ vec2 pos = position.xy * scale * 2.0 * px + center; vUv = uv; gl_Position = vec4(pos, 0.0, 1.0); }`

    const advection_frag = `precision highp float; uniform sampler2D velocity; uniform float dt; uniform bool isBFECC; uniform vec2 fboSize; uniform vec2 px; varying vec2 uv; void main(){ vec2 ratio = max(fboSize.x, fboSize.y) / fboSize; if(isBFECC == false){ vec2 vel = texture2D(velocity, uv).xy; vec2 uv2 = uv - vel * dt * ratio; vec2 newVel = texture2D(velocity, uv2).xy; gl_FragColor = vec4(newVel, 0.0, 0.0); } else { vec2 spot_new = uv; vec2 vel_old = texture2D(velocity, uv).xy; vec2 spot_old = spot_new - vel_old * dt * ratio; vec2 vel_new1 = texture2D(velocity, spot_old).xy; vec2 spot_new2 = spot_old + vel_new1 * dt * ratio; vec2 error = spot_new2 - spot_new; vec2 spot_new3 = spot_new - error / 2.0; vec2 vel_2 = texture2D(velocity, spot_new3).xy; vec2 spot_old2 = spot_new3 - vel_2 * dt * ratio; vec2 newVel2 = texture2D(velocity, spot_old2).xy; gl_FragColor = vec4(newVel2, 0.0, 0.0); } }`
    const color_frag = `precision highp float; uniform sampler2D velocity; uniform sampler2D palette; uniform vec4 bgColor; varying vec2 uv; void main(){ vec2 vel = texture2D(velocity, uv).xy; float lenv = clamp(length(vel), 0.0, 1.0); vec3 c = texture2D(palette, vec2(lenv, 0.5)).rgb; vec3 outRGB = mix(bgColor.rgb, c, lenv); float outA = mix(bgColor.a, 1.0, lenv); gl_FragColor = vec4(outRGB, outA); }`
    const divergence_frag = `precision highp float; uniform sampler2D velocity; uniform float dt; uniform vec2 px; varying vec2 uv; void main(){ float x0 = texture2D(velocity, uv-vec2(px.x, 0.0)).x; float x1 = texture2D(velocity, uv+vec2(px.x, 0.0)).x; float y0 = texture2D(velocity, uv-vec2(0.0, px.y)).y; float y1 = texture2D(velocity, uv+vec2(0.0, px.y)).y; float divergence = (x1 - x0 + y1 - y0) / 2.0; gl_FragColor = vec4(divergence / dt); }`
    const externalForce_frag = `precision highp float; uniform vec2 force; uniform vec2 center; uniform vec2 scale; uniform vec2 px; varying vec2 vUv; void main(){ vec2 circle = (vUv - 0.5) * 2.0; float d = 1.0 - min(length(circle), 1.0); d *= d; gl_FragColor = vec4(force * d, 0.0, 1.0); }`
    const poisson_frag = `precision highp float; uniform sampler2D pressure; uniform sampler2D divergence; uniform vec2 px; varying vec2 uv; void main(){ float p0 = texture2D(pressure, uv + vec2(px.x * 2.0, 0.0)).r; float p1 = texture2D(pressure, uv - vec2(px.x * 2.0, 0.0)).r; float p2 = texture2D(pressure, uv + vec2(0.0, px.y * 2.0)).r; float p3 = texture2D(pressure, uv - vec2(0.0, px.y * 2.0)).r; float div = texture2D(divergence, uv).r; float newP = (p0 + p1 + p2 + p3) / 4.0 - div; gl_FragColor = vec4(newP); }`
    const pressure_frag = `precision highp float; uniform sampler2D pressure; uniform sampler2D velocity; uniform vec2 px; uniform float dt; varying vec2 uv; void main(){ float step = 1.0; float p0 = texture2D(pressure, uv + vec2(px.x * step, 0.0)).r; float p1 = texture2D(pressure, uv - vec2(px.x * step, 0.0)).r; float p2 = texture2D(pressure, uv + vec2(0.0, px.y * step)).r; float p3 = texture2D(pressure, uv - vec2(0.0, px.y * step)).r; vec2 v = texture2D(velocity, uv).xy; vec2 gradP = vec2(p0 - p1, p2 - p3) * 0.5; v = v - gradP * dt; gl_FragColor = vec4(v, 0.0, 1.0); }`
    const viscous_frag = `precision highp float; uniform sampler2D velocity; uniform sampler2D velocity_new; uniform float v; uniform vec2 px; uniform float dt; varying vec2 uv; void main(){ vec2 old = texture2D(velocity, uv).xy; vec2 new0 = texture2D(velocity_new, uv + vec2(px.x * 2.0, 0.0)).xy; vec2 new1 = texture2D(velocity_new, uv - vec2(px.x * 2.0, 0.0)).xy; vec2 new2 = texture2D(velocity_new, uv + vec2(0.0, px.y * 2.0)).xy; vec2 new3 = texture2D(velocity_new, uv - vec2(0.0, px.y * 2.0)).xy; vec2 newv = 4.0 * old + v * dt * (new0 + new1 + new2 + new3); newv /= 4.0 * (1.0 + v * dt); gl_FragColor = vec4(newv, 0.0, 0.0); }`

    // ShaderPass base
    class ShaderPass {
      constructor(props) {
        this.props = props || {}
        this.uniforms = this.props.material?.uniforms
      }
      init() {
        this.scene = new Scene()
        scenes.add(this.scene)
        this.camera = new Camera()
        if (this.uniforms) {
          this.material = new RawShaderMaterial(this.props.material)
          this.geometry = new PlaneGeometry(2.0, 2.0)
          this.plane = new Mesh(this.geometry, this.material)
          this.scene.add(this.plane)
        }
      }
      update() {
        Common.renderer.setRenderTarget(this.props.output || null)
        Common.renderer.render(this.scene, this.camera)
        Common.renderer.setRenderTarget(null)
      }
    }

    class Advection extends ShaderPass {
      constructor(p) {
        super({
          material: {
            vertexShader: face_vert,
            fragmentShader: advection_frag,
            uniforms: {
              boundarySpace: { value: p.cellScale },
              px: { value: p.cellScale },
              fboSize: { value: p.fboSize },
              velocity: { value: p.src.texture },
              dt: { value: p.dt },
              isBFECC: { value: true },
            },
          },
          output: p.dst,
        })
        this.uniforms = this.props.material.uniforms
        this.init()
        const bg = new BufferGeometry()
        bg.setAttribute(
          'position',
          new BufferAttribute(
            new Float32Array([
              -1, -1, 0, -1, 1, 0, -1, 1, 0, 1, 1, 0, 1, 1, 0, 1, -1, 0, 1, -1, 0, -1, -1, 0,
            ]),
            3,
          ),
        )
        this.line = new LineSegments(
          bg,
          new RawShaderMaterial({
            vertexShader: line_vert,
            fragmentShader: advection_frag,
            uniforms: this.uniforms,
          }),
        )
        this.scene.add(this.line)
      }
      update({ dt, isBounce, BFECC }) {
        this.uniforms.dt.value = dt
        this.line.visible = isBounce
        this.uniforms.isBFECC.value = BFECC
        super.update()
      }
    }

    class ExternalForce extends ShaderPass {
      constructor(p) {
        super({ output: p.dst })
        this.init()
        this._init2(p)
      }
      _init2(p) {
        const mg = new PlaneGeometry(1, 1)
        const mm = new RawShaderMaterial({
          vertexShader: mouse_vert,
          fragmentShader: externalForce_frag,
          blending: AdditiveBlending,
          depthWrite: false,
          uniforms: {
            px: { value: p.cellScale },
            force: { value: new Vector2(0, 0) },
            center: { value: new Vector2(0, 0) },
            scale: { value: new Vector2(p.cursor_size, p.cursor_size) },
          },
        })
        this.mouse = new Mesh(mg, mm)
        this.scene.add(this.mouse)
      }
      update(props) {
        const fx = (Mouse.diff.x / 2) * props.mouse_force
        const fy = (Mouse.diff.y / 2) * props.mouse_force
        const csX = props.cursor_size * props.cellScale.x
        const csY = props.cursor_size * props.cellScale.y
        const cx = Math.min(
          Math.max(Mouse.coords.x, -1 + csX + props.cellScale.x * 2),
          1 - csX - props.cellScale.x * 2,
        )
        const cy = Math.min(
          Math.max(Mouse.coords.y, -1 + csY + props.cellScale.y * 2),
          1 - csY - props.cellScale.y * 2,
        )
        const u = this.mouse.material.uniforms
        u.force.value.set(fx, fy)
        u.center.value.set(cx, cy)
        u.scale.value.set(props.cursor_size, props.cursor_size)
        super.update()
      }
    }

    class Viscous extends ShaderPass {
      constructor(p) {
        super({
          material: {
            vertexShader: face_vert,
            fragmentShader: viscous_frag,
            uniforms: {
              boundarySpace: { value: p.boundarySpace },
              velocity: { value: p.src.texture },
              velocity_new: { value: p.dst_.texture },
              v: { value: p.viscous },
              px: { value: p.cellScale },
              dt: { value: p.dt },
            },
          },
          output: p.dst,
          output0: p.dst_,
          output1: p.dst,
        })
        this.init()
      }
      update({ viscous, iterations, dt }) {
        this.uniforms.v.value = viscous
        let fbo_in, fbo_out
        for (let i = 0; i < iterations; i++) {
          if (i % 2 === 0) {
            fbo_in = this.props.output0
            fbo_out = this.props.output1
          } else {
            fbo_in = this.props.output1
            fbo_out = this.props.output0
          }
          this.uniforms.velocity_new.value = fbo_in.texture
          this.props.output = fbo_out
          this.uniforms.dt.value = dt
          super.update()
        }
        return fbo_out
      }
    }

    class Divergence extends ShaderPass {
      constructor(p) {
        super({
          material: {
            vertexShader: face_vert,
            fragmentShader: divergence_frag,
            uniforms: {
              boundarySpace: { value: p.boundarySpace },
              velocity: { value: p.src.texture },
              px: { value: p.cellScale },
              dt: { value: p.dt },
            },
          },
          output: p.dst,
        })
        this.init()
      }
      update({ vel }) {
        this.uniforms.velocity.value = vel.texture
        super.update()
      }
    }

    class Poisson extends ShaderPass {
      constructor(p) {
        super({
          material: {
            vertexShader: face_vert,
            fragmentShader: poisson_frag,
            uniforms: {
              boundarySpace: { value: p.boundarySpace },
              pressure: { value: p.dst_.texture },
              divergence: { value: p.src.texture },
              px: { value: p.cellScale },
            },
          },
          output: p.dst,
          output0: p.dst_,
          output1: p.dst,
        })
        this.init()
      }
      update({ iterations }) {
        let p_in, p_out
        for (let i = 0; i < iterations; i++) {
          if (i % 2 === 0) {
            p_in = this.props.output0
            p_out = this.props.output1
          } else {
            p_in = this.props.output1
            p_out = this.props.output0
          }
          this.uniforms.pressure.value = p_in.texture
          this.props.output = p_out
          super.update()
        }
        return p_out
      }
    }

    class Pressure extends ShaderPass {
      constructor(p) {
        super({
          material: {
            vertexShader: face_vert,
            fragmentShader: pressure_frag,
            uniforms: {
              boundarySpace: { value: p.boundarySpace },
              pressure: { value: p.src_p.texture },
              velocity: { value: p.src_v.texture },
              px: { value: p.cellScale },
              dt: { value: p.dt },
            },
          },
          output: p.dst,
        })
        this.init()
      }
      update({ vel, pressure }) {
        this.uniforms.velocity.value = vel.texture
        this.uniforms.pressure.value = pressure.texture
        super.update()
      }
    }

    class Simulation {
      constructor(opts) {
        this.options = {
          iterations_poisson: 12,
          iterations_viscous: 32,
          mouse_force: 20,
          resolution: 0.4,
          cursor_size: 100,
          viscous: 30,
          isBounce: false,
          dt: 0.014,
          isViscous: false,
          BFECC: true,
          ...opts,
        }
        this.fbos = {}
        this.fboSize = new Vector2()
        this.cellScale = new Vector2()
        this.boundarySpace = new Vector2()
        this.init()
      }
      getFloatType() {
        return /(iPad|iPhone|iPod)/i.test(navigator.userAgent) ? HalfFloatType : FloatType
      }
      init() {
        this.calcSize()
        this.createAllFBO()
        this.createShaderPass()
      }
      createAllFBO() {
        const type = this.getFloatType()
        const opts = {
          type,
          depthBuffer: false,
          stencilBuffer: false,
          minFilter: LinearFilter,
          magFilter: LinearFilter,
          wrapS: ClampToEdgeWrapping,
          wrapT: ClampToEdgeWrapping,
        }
        for (const key of [
          'vel_0',
          'vel_1',
          'vel_viscous0',
          'vel_viscous1',
          'div',
          'pressure_0',
          'pressure_1',
        ]) {
          this.fbos[key] = new WebGLRenderTarget(this.fboSize.x, this.fboSize.y, opts)
          renderTargets.add(this.fbos[key])
        }
      }
      createShaderPass() {
        this.advection = new Advection({
          cellScale: this.cellScale,
          fboSize: this.fboSize,
          dt: this.options.dt,
          src: this.fbos.vel_0,
          dst: this.fbos.vel_1,
        })
        this.externalForce = new ExternalForce({
          cellScale: this.cellScale,
          cursor_size: this.options.cursor_size,
          dst: this.fbos.vel_1,
        })
        this.viscous = new Viscous({
          cellScale: this.cellScale,
          boundarySpace: this.boundarySpace,
          viscous: this.options.viscous,
          src: this.fbos.vel_1,
          dst: this.fbos.vel_viscous1,
          dst_: this.fbos.vel_viscous0,
          dt: this.options.dt,
        })
        this.divergence = new Divergence({
          cellScale: this.cellScale,
          boundarySpace: this.boundarySpace,
          src: this.fbos.vel_viscous0,
          dst: this.fbos.div,
          dt: this.options.dt,
        })
        this.poisson = new Poisson({
          cellScale: this.cellScale,
          boundarySpace: this.boundarySpace,
          src: this.fbos.div,
          dst: this.fbos.pressure_1,
          dst_: this.fbos.pressure_0,
        })
        this.pressure = new Pressure({
          cellScale: this.cellScale,
          boundarySpace: this.boundarySpace,
          src_p: this.fbos.pressure_0,
          src_v: this.fbos.vel_viscous0,
          dst: this.fbos.vel_0,
          dt: this.options.dt,
        })
      }
      calcSize() {
        const w = Math.max(1, Math.round(this.options.resolution * Common.width))
        const h = Math.max(1, Math.round(this.options.resolution * Common.height))
        this.cellScale.set(1.0 / w, 1.0 / h)
        this.fboSize.set(w, h)
      }
      resize() {
        this.calcSize()
        for (const key in this.fbos) this.fbos[key].setSize(this.fboSize.x, this.fboSize.y)
      }
      update() {
        if (this.options.isBounce) this.boundarySpace.set(0, 0)
        else this.boundarySpace.copy(this.cellScale)
        this.advection.update({
          dt: this.options.dt,
          isBounce: this.options.isBounce,
          BFECC: this.options.BFECC,
        })
        this.externalForce.update({
          cursor_size: this.options.cursor_size,
          mouse_force: this.options.mouse_force,
          cellScale: this.cellScale,
        })
        let vel = this.fbos.vel_1
        if (this.options.isViscous)
          vel = this.viscous.update({
            viscous: this.options.viscous,
            iterations: this.options.iterations_viscous,
            dt: this.options.dt,
          })
        this.divergence.update({ vel })
        const pressure = this.poisson.update({ iterations: this.options.iterations_poisson })
        this.pressure.update({ vel, pressure })
      }
    }

    class Output {
      constructor() {
        this.init()
      }
      init() {
        this.simulation = new Simulation()
        this.scene = new Scene()
        scenes.add(this.scene)
        this.camera = new Camera()
        this.output = new Mesh(
          new PlaneGeometry(2, 2),
          new RawShaderMaterial({
            vertexShader: face_vert,
            fragmentShader: color_frag,
            transparent: true,
            depthWrite: false,
            uniforms: {
              velocity: { value: this.simulation.fbos.vel_0.texture },
              boundarySpace: { value: new Vector2() },
              palette: { value: paletteTex },
              bgColor: { value: bgVec4 },
            },
          }),
        )
        this.scene.add(this.output)
      }
      resize() {
        this.simulation.resize()
      }
      render() {
        Common.renderer.setRenderTarget(null)
        Common.renderer.render(this.scene, this.camera)
      }
      update() {
        this.simulation.update()
        this.render()
      }
    }

    // Init
    Common.init(container)
    Mouse.init(container)
    const output = new Output()
    AutoDriver.init(Mouse, { lastUserInteraction: 0 })
    AutoDriver.enabled = false

    container.prepend(Common.renderer.domElement)
    let isVisible = true
    let rafHandle = 0
    const loop = () => {
      rafHandle = 0
      if (disposed || !isVisible || document.hidden) return
      AutoDriver.update()
      Mouse.update()
      Common.update()
      output.update()
      rafHandle = requestAnimationFrame(loop)
    }
    const schedule = () => {
      if (disposed || !isVisible || document.hidden) {
        cancelAnimationFrame(rafHandle)
        rafHandle = 0
        return
      }
      if (!rafHandle) rafHandle = requestAnimationFrame(loop)
    }
    cleanups.push(() => {
      cancelAnimationFrame(rafHandle)
      Common.clock.stop()
    })
    listen(window, 'resize', () => {
      Common.resize()
      output.resize()
    })
    listen(document, 'visibilitychange', schedule)
    listen(renderer.domElement, 'webglcontextlost', (event) => {
      event.preventDefault()
      dispose()
      onUnavailable()
    })
    if ('IntersectionObserver' in window) {
      const visibilityObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            isVisible = entry.isIntersecting
          })
          schedule()
        },
        { threshold: 0 },
      )
      visibilityObserver.observe(container)
      cleanups.push(() => visibilityObserver.disconnect())
    }
    schedule()
    return Object.assign(dispose, {
      setTheme(theme) {
        if (disposed) return
        const background = new Color(theme === 'dark' ? 0x08080d : 0xffffff)
        bgVec4.set(background.r, background.g, background.b, 1)
        renderer.setClearColor(background, 1)
        // Recolor the existing velocity field; do not advance or reset it.
        output.render()
      },
    })
  } catch (error) {
    dispose()
    throw error
  }
}
