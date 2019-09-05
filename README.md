# Radial Menu Component in Vue.js

![Radial menu screenshot](https://raw.githubusercontent.com/axln/radial-menu-vue/master/radial-menu.png

## Controls

 1. Go to [https://axln.github.io/radial-menu-vue/dist/index.html](https://axln.github.io/radial-menu-vue/dist/index.html).

 2. Click Open Menu button.

 3. You can use mouse, mouse wheel and keyboard for navigation:
    * Arrow keys and mouse wheel to select menu item.
    * Enter to choose the selected menu item.
    * Esc/Backspace to return to parent menu and close menu.

 ## Usage Example

 ```html
 <button @click="openMenu">Open Menu</button>
 <button @click="closeMenu">Close Menu</button>
 <RadialMenu ref="radialMenu" @clicked="menuClicked" :menu-items="menuItems" :size="400" close-on-click></RadialMenu>
 ```

 ```javascript
  import RadialMenu from './components/RadialMenu/RadialMenu.vue'

  export default {
      name: 'app',
      data: function () {
          return {
              menuItems: [
                   {
                       id   : 'walk',
                       title: 'Walk',
                       icon: '#walk'
                   },
                   {
                       id   : 'run',
                       title: 'Run',
                       icon: '#run'
                   },
                   ...
               ];
          }
      },
      methods: {
          menuClicked: function (menuItem) {
              console.log('Menu item click:', menuItem.id);
          },
          openMenu: function () {
              this.$refs.radialMenu.open();
          },
          closeMenu: function () {
              this.$refs.radialMenu.close();
          }
    },
    components: {
        RadialMenu
    }
  }
```

## Vue CLI Project Setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Run your tests
```
npm run test
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
