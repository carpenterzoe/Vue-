
// 通过install 把Vue保存起来，并且这里导出
// 所以插件其他地方都可以用到Vue
export let _Vue

export function install (Vue) {

  // 挂一个属性installed， 让该方法只执行一次。
  if (install.installed && _Vue === Vue) return

  install.installed = true
  _Vue = Vue

  const isDef = v => v !== undefined

  // ? 这是干啥的
  const registerInstance = (vm, callVal) => {
    let i = vm.$options._parentVnode
    if ( isDef(i) 
      && isDef(i = i.data)
      && isDef(i = i.registerRouteInstance)
    ) {
      i(vm, callVal)
    }
  }

  Vue.mixin({
    beforeCreate() {

      // 实例化的时候，配置项有传入router，一般是 根组件。
      if (isDef(this.$options.router)) {

        // 如果配置项有传 router， 那么 _routerRoot 就是当前实例。
        // 这里把 根实例 保存起来，后续需要用到。
        this._routerRoot = this
        
        // 把配置项存到 _router， 并初始化 init
        this._router = this.$options.router
        this._router.init(this)   // * CORE 

        // 新增响应式属性 _route
        // ? this._router.history.current 是啥玩意？

        Vue.util.defineReactive(this, '_route', this._router.history.current)

      } else {

        // 非根Vue实例，找父级取到 根Vue实例 并保存为 _routerRoot 属性。
        // 这样在每个组件中都能访问到 _routerRoot 根Vue实例。
        this._routerRoot = (this.$parent && this.$parent._routerRoot) || this
      }

      registerInstance(this, this)
    },
    destroyed() {
      registerInstance(this)
    }
  })

  Object.defineProperty(Vue.prototype, '$router', {
    get() {
      return this._routerRoot._router
    }
  })
  Object.defineProperty(Vue.prototype, '$route', {
    get() {

      // 根实例初始化的时候有define _route
      // Vue.util.defineReactive(this, '_route', this._router.history.current)

      return this._routerRoot._route
    }
  })

  // 全局注册组件
  Vue.component('RouterView', View)
  Vue.component('RouterLink', Link)

  const strats = Vue.config.optionMergeStrategies

  // ? 这是在干啥玩意
  strats.beforeRouteEnter = strats.beforeRouteLeave = strats.
  beforeRouteUpdate = strats.created
}