<template>
  <tr class="graphEntryDetailed" :class="{'active': activated}" :data-level="this.level" :title="type + ': ' + id" :data-id="id">
    <td class="thingLabel" @click="activateThing">
      <!-- <template v-if="isCurrent && activated">
        <input type="text" v-model.trim="label"/>
      </template>
      <template v-else> -->
      <span class="itemLabel">{{ label }}</span> <!--  @dblclick="startEditing" -->
      <!-- </template> -->
    </td>
    <td class="resp" :title="resp">
      <i class="icon icon-people"></i>
    </td>

    <!--<div class="firstLine">

      <div class="editButtons float-right">
        <template v-if="isCurrent && activated && this.level === 1">
          <i class="icon icon-cross" @click.stop="discardChanges" title="cancel changes"></i>
          <i class="icon icon-check" @click.stop="saveChanges" title="save changes"></i>
        </template>
        <template v-if="!isCurrent && activated && this.level === 1">
          <i class="icon icon-edit" @click.stop="startEditing"></i>
        </template>
        <i class="icon icon-search" @click.stop="showLD"></i>
      </div>
      <i class="icon icon-caret" v-if="this.level === 1" @click.stop="deactivateThing"></i>

    </div>
    <div v-if="activated && this.level === 1" class="contents">
      <GraphEntry v-for="(c, cI) in children" :key="cI" :file="c" :level="this.level + 1" :type="childType"/>
    </div>-->
  </tr>
</template>

<script>
import {
  asUrl,
  createSolidDataset,
  setThing,
  getThingAll,
  getStringNoLocale,
  solidDatasetAsTurtle
} from '@inrupt/solid-client'
import { prefix as pref } from '@/meld/prefixes.js'
import { getChildType } from '@/store/tools/solidHelpers.js'
import { displayPrefixes } from '@/meld/constants.js'

export default {
  name: 'GraphEntryDetailed',
  components: {

  },
  props: {
    file: Object,
    type: String,
    level: Number
  },
  computed: {
    id: function () {
      const baseUrl = this.$store.getters.dataBaseUrl
      const url = asUrl(this.thing, baseUrl)
      return url
    },
    activated: function () {
      return this.$store.getters.activeThingIDByType(this.type) === this.id
    },
    currentThing: function () {
      const thing = this.$store.getters.currentThingByTypeAndID(this.type, this.id)

      if (thing === undefined) {
        return null
      }
      return thing
    },
    isCurrent: function () {
      return this.currentThing !== null
    },
    childType: function () {
      return getChildType(this.type)
    },
    children: function () {
      const children = this.$store.getters.childrenByTypeAndID(this.type, this.id)
      return children
    },
    label: {
      get () {
        let label = getStringNoLocale(this.thing, pref.rdfs + 'label')

        if (label === '') {
          label = '[no label]'
        }

        return label
      },
      set (val) {
        this.$store.dispatch('changeCurrentDataObject', {
          type: this.type,
          uri: this.uri,
          prop: pref.rdfs + 'label',
          method: 'setStringNoLocale',
          val
        })
      }
    },
    resp: function () {
      const file = (this.isCurrent) ? this.$store.getters.currentThingByTypeAndID(this.type, this.id) : this.file
      const thing = getThingAll(file)[0]
      const user = getStringNoLocale(thing, pref.dct + 'creator')
      return user
    }
  },
  methods: {
    activateThing: function () {
      console.log('activating ' + this.type + ' ' + this.id)
      this.$store.dispatch('activateThing', { type: this.type, id: this.id })
    },
    deactivateThing: function () {
      if (this.activated) {
        this.$store.dispatch('activateThing', { type: this.type, id: null })
      }
    },
    /* startEditing: function () {
      if (this.level === 1) {
        this.$store.dispatch('startEditing', { type: this.type, id: this.id })
      }
    }, */
    saveChanges: function () {
      this.$store.dispatch('saveChanges')
    },
    discardChanges: function () {
      this.$store.dispatch('discardChanges')
    },
    /* select: function () {
      if (this.type === bithTypes.extract) {
        this.$store.dispatch('setActiveExtract', this.id)
      }
    }, */
    showLD: async function (e) {
      let ds = createSolidDataset()
      ds = setThing(ds, this.thing)

      const ttl = await solidDatasetAsTurtle(ds, { prefixes: displayPrefixes })
      // console.log(this.id + ' (' + ttl.length + ')')
      this.$store.dispatch('setLdDetails', ttl)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/css/_variables.scss';

.graphEntryDetailed {
  text-align: left;
  margin: 0 0 .05rem;
  padding: .05rem;
  font-size: .8rem;

  td {
    padding: .2rem .3rem;
  }

  &.active[data-level="1"] > .firstLine {
    background-color: lighten($uiHighlightColor, 30%);
  }

  &.active[data-level="2"] > .firstLine {
    background-color: lighten($uiHighlightColor, 40%);
  }

  &[data-level="2"] {
    margin-left: 1.5rem;
    font-size: .6rem;
  }

  &.active {
    & > .firstLine > i {
      transform: rotate(0deg);
    }
  }

  .firstLine {
    height: 30px;
    border-radius: 3px;

    & > i {
      transform: rotate(-90deg);
      display: inline-block;
      width: 1rem;
    }

    .editButtons {
      margin: 0 .3rem;

      i {
        margin-left: .3rem;
      }
    }

    .itemLabel {

    }
  }
}
</style>
