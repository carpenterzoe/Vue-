
export default class VueRouter {
  static install: () => void
  static version: string

  app: any
  apps: Array<any>    // ?
  ready: Boolean
  readyCbs: Array<Function>
  options: RouterOptions
  mode: string
  history: HashHistory | HTML5History | AbstractHistory
  matcher: Matcher    // ?
  fallback: Boolean
  beforeHooks: Array<?NavigationGuard>
  resolveHooks: Array<?NavigationGuard>
  afterHooks: Array<?NavigationGuard>

  constructor(options: RouterOptions = {}) {

    this.app = null
    this.apps = []
    this.options = options
    this.beforeHooks = []
    this.resolveHooks = []
    this.afterHooks = []

    // * CORE 
    this.matcher = createMatcher(options.routes || [], this)

    var mode = options.mode || 'hash';
    this.fallback =
      mode === 'history' && !supportsPushState && options.fallback !== false;

    // 没有history 降级为 hash
    if (this.fallback) {
      mode = 'hash';
    }
    if (!inBrowser) {
      mode = 'abstract';
    }
    this.mode = mode;

    switch (mode) {
      case 'history':

        // history  对路由的管理，当前路由 跳转路由等
        this.history = new HTML5History(this, options.base);
        break
      case 'hash':
        this.history = new HashHistory(this, options.base, this.fallback);
        break
      case 'abstract':
        this.history = new AbstractHistory(this, options.base);
        break

      // default + { } 写法第一次见。。  怎么执行？？
      default:
        {
          assert(false, ("invalid mode: " + mode));
        }
    }
  }
}