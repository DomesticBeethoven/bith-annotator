<template>
  <header>
    <UserManagement/>
    <h1>Beethoven in the House – Annotator
      <!--<button v-on:click="goHome" class="btn btn-sm">Home</button>-->
      <!--<button v-on:click="showWorkbench" class="btn btn-sm">Workbench</button>-->
      <!--<button v-on:click="showLibrary" class="btn btn-sm">Library</button>-->
      <!--<button v-on:click="toggleDebugOverlay" class="btn btn-sm">Debug</button>-->
    </h1>
  </header>
</template>

<script>
import UserManagement from './AppHeader/UserManagement.vue'
export default {
  name: 'AppHeader',
  components: {
    UserManagement
  },
  computed: {
    /* showSelectionTool: function () {
      return this.$store.getters.selectionToolVisible
    } */
  },
  methods: {
    goHome: function () {
      this.$store.dispatch('setPerspective', 'landingPage')
    },
    showLibrary: function () {
      this.$store.dispatch('setPerspective', 'library')
    },
    showWorkbench: function () {
      this.$store.dispatch('setPerspective', 'workbench')
    },
    toggleDebugOverlay: function () {
      this.$store.dispatch('toggleDebugOverlay')
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import '@/css/_variables.scss';

header {
  background: linear-gradient(to bottom, $mainBackgroundColor, darken($mainBackgroundColor, 20%));
  border-bottom: .5px solid #999999;
  padding: .2rem 1rem;
  height: $appHeaderHeight;

  h1 {
    text-align: left;
    margin: 0;
    font-size: 1.2rem;
    font-weight: 300;
  }
  button {
    margin: 0rem 0.5rem;
  }
}
</style>
