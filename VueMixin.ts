import { mergeOptions } from './util/options'

// mixin 实际上就是配置项合并

export function initMixin(Vue: GlobalAPI) {
  Vue.mixin = function(mixin: Object) {
    this.options = mergeOptions(this.options, mixin)
    return this
  }
}