import Vue from 'vue'
import App from './App.vue'
import LikedTracks from "./components/LikedTracks";
import vuetify from './plugins/vuetify';

Vue.config.productionTip = false;

new Vue({
  components: {
    LikedTracks
  },
  vuetify,
  render: h => h(App)
}).$mount('#app');
