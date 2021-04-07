/**
 * Convert an Array-like object to a real Array.
 */
function toArray (list: any, start?: number): Array<any> {
  start = start || 0
  let i = list.length - start
  const ret: Array<any> = new Array(i)
  while (i--) {
    ret[i] = list[i + start]
  }
  return ret
}

/**
 * Vue.use(MyPlugin)
 * Vue.use(MyPlugin, { someOption: true })
 * 
 * 两种调用Vue.use的传参方式
 */

export function initUse(Vue: GlobalAPI) {
  Vue.use = function(plugin: Function | Object) {
    // 先获取已安装的插件
    const installedPlugins = (this._installedPlugins || (
      this._installedPlugins = []
    ))

    // 注册插件不可重复
    if (installedPlugins.indexOf(plugin) !== -1) {
      return this  // return this 是把 Vue return ？ 意义是什么？
    }

    // arguments 第0位 是plugin， 后面才是自定义的一些参数。
    // 参见 Vue.use() 传参的两种方式。

    const args = toArray(arguments, 1)

    // unshift 向数组开头添加元素，这里是把 this => Vue 添加到参数中。
    // 因为写插件时，不会引入Vue (会造成插件体积太大)
    // 所以这里把Vue 作为参数，添加进来。因为插件中可能需要用到Vue的属性或者方法。
    args.unshift(this)

    if (typeof plugin.install === 'function') {
      plugin.install.apply(plugin, args)
    } else if (typeof plugin === 'function') {
      plugin.apply(plugin, args)
    }

    installedPlugins.push(plugin)
    return this
  }
}