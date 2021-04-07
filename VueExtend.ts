import { mergeOptions } from "./util/options"

let Vue = function() {}

/**
 * Vue.extend 的作⽤就是构造⼀个 Vue 的⼦类 （仍然是构造器）
 * 
 * 它使⽤⼀种⾮常经典的 原型继承 的⽅式
 * 把⼀个纯对象 转换成⼀个继承于 Vue 的构造器 Sub 并返回
 * 
 * 然后对 Sub 这个对象本⾝扩展了⼀些属性，如扩展 options 、添加全局 API 等；
 * 并且对配置中的 props 和 computed 做了初始化⼯作；
 * 
 * 最后对于这个 Sub 构造函数做了缓存，
 * 避免多次执⾏ Vue.extend 的时候对同⼀个⼦类重复构造。 
 * 
 * 这样当我们去实例化 Sub 的时候
 * 就会执⾏ this._init 逻辑，再次⾛到了 Vue 实例的初始化逻辑
 * 
 * 可以理解成是 预设了部分组件options 的Vue构造函数
 * new Vue() 和 new MessageBoxCtor() （Vue.extend 拿到的子类） 做的事情基本一样
 * 但是new Vue()的时候需要给它一个组件options，比如 new Vue(MessageBox)
 * 但是new MessageBoxCtor()的时候不需要，因为它已经在extend的时候设置好了
 */


export function initExtend(Vue: GlobalAPI) {
  
  // 这个cid是一个全局唯一的递增的id
  // 缓存的时候会用到它

  Vue.cid = 0
  let cid = 1

  Vue.extend = function(extendOptions: Object): Function {

    extendOptions = extendOptions || {}
    
    // Super => Vue
    const Super = this    // function 调用者，就是 Vue
    const SuperId = Super.cid
  
    // 缓存的子类  对于同个对象作为option，Vue.extend 仅执行一次。
    // 每次创建完Sub构造函数后，都会把这个函数储存在extendOptions上的 _Ctor 中 
    // 下次如果用再 同一个extendOptions 创建Sub 时，就会直接从 _Ctor 返回
    const cachedCtors = extendOptions._Ctor || (extendOptions._Ctor = {})
    if (cachedCtors[SuperId]) {
      return cachedCtors[SuperId]   // 构造器存在，直接返回
    }
 
    // 写组件时候的name，如果没写就使用父组件的name
    const name = extendOptions.name || Super.options.name
    if (process.env.NODE_ENV !== 'production' && name) {
      validateComponentName(name)   // 判断name不能是html元素和不能是非法命名
    }
  
    // 子类
    const Sub = function VueComponent(options) {
      this._init(options)   // this => Vue  所以这里是Vue初始化的方法
    }
  
    // 原型继承
    Sub.prototype = Object.create(Super.prototype)
    Sub.prototype.constructor = Sub

    // 每个组件的唯一标识符。cid 缓存到闭包中的，保证唯一且递增
    // cid 定义在 initExtend 的闭包中，每个 Vue组件 只会执行一次初始化。
    Sub.cid = cid++

    // 将组件的options和Vue的options合并，得到一个完整的options 
    // 可以理解为将Vue的一些全局的属性，比如全局注册的组件和mixin，分给了Sub
    Sub.options = mergeOptions(
      Super.options,
      extendOptions
    )
    Sub['super'] = Super
  
    if (Sub.options.props) {
      initProps(Sub)    // initProps 从哪来
    }
    if (Sub.options.computed) {
      initComputed(Sub)   // initComputed 从哪来
    }
 
    
    // 将父类的方法复制到子类  - Class上面的静态方法
    Sub.extend = Super.extend
    Sub.mixin = Super.mixin
    Sub.use = Super.use
  
    ASSET_TYPES.forEach( type => {
      Sub[type] = Super[type]
    })
  
    if (name) {
      Sub.options.components[name] = Sub
    }
  
    Sub.superOptions = Super.options
    Sub.extendOptions = extendOptions
    Sub.sealedOptions = extend({}, Sub.options)   // ? extend 哪来的
 
    
    // cachedCtors => extendOptions._Ctor  
    // 也就是会挂到当前子类的 extendOptions 属性上
    cachedCtors[SuperId] = Sub
    return Sub
  }
}