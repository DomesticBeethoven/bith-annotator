<template>
  <div v-bind:id="'meiContainer_' + idSeed" class="meiContainer">
    <span v-bind:id="'activity_' + idSeed">Loading</span> MEI Data
    <div class="loading loading-lg"></div>
  </div>
</template>

<script>
import verovio from 'verovio'
import svgDragSelect from "svg-drag-select"
import { vrvPresets, vrvSelectables } from './../../../config/verovio.config.js'

const verovioOptions = {
  scale: 30,
  breaks: 'none',
  openControlEvents: true,
  svgBoundingBoxes: true,
  svgRemoveXlink: true,
  header: 'none',
  footer: 'none',
  mnumInterval: 5
}

let listeners = []
/*
let addListener = (anchor) => {
  listeners.push(anchor.addEventListener('click',(e) => {
    const staff = e.target.parentNode.parentNode
    staff.classList.toggle('marked')
  }))
}
*/
export default {
  name: 'Verovio',
  props: {
    uri: String,
    idSeed: String,
    settings: String
  },
  computed: {
    selectionModeActive: function() {
      return this.$store.getters.selectionModeActive
    },
    currentSelection: function() {
      return this.$store.getters.activeSelection
    },
    currentExtract: function() {
      return this.$store.getters.activeExtract
    }
  },
  methods: {

  },
  mounted: function () {

    const vrvToolkit = new verovio.toolkit()
    const options = (typeof vrvPresets[this.settings] === 'object') ? vrvPresets[this.settings] : vrvPresets.fullScore

    vrvToolkit.setOptions(options)

    fetch(this.uri)
      .then(res => {
        document.querySelector('#activity_' + this.idSeed).innerHTML = 'Processing'
        return res.text()
      })
      .then(mei => {
        vrvToolkit.loadData(mei)
        const svg = vrvToolkit.renderToSVG(1, {})
        document.querySelector('#meiContainer_' + this.idSeed).innerHTML = svg

        if(this.settings === 'fullScore') {
          const renderedSvg = document.querySelector('#meiContainer_' + this.idSeed + ' svg')

          let selectables = []
          let selNoBBox = []
          vrvSelectables.forEach(elem => {
            selectables.push('.' + elem + ':not(.bounding-box)')
          })
          selectables = selectables.join(', ')
          console.log('selectables:', selectables)
          const clickListener = (e) => {
            e.stopPropagation();
            if(!this.selectionModeActive) {
              return false
            }
            const target = e.target
            const closest = (e.shiftKey) ? target.closest('.measure:not(.bounding-box)') : target.closest(selectables)

            if(closest.classList.contains('staff') || closest.classList.contains('measure')) {
              console.log('selected a staff or measure')
              const children = closest.querySelectorAll(selectables)
              console.log('found children:')
              console.log(children)
            }

            console.log('clicked ', target, closest)
            this.$store.dispatch('selectionToggle', this.uri + '#' + closest.getAttribute('data-id'))

            // todo: this needs to be coming from the store…
            // closest.classList.toggle('selected')
          }

          //renderedSvg.addEventListener('click', clickListener)
          renderedSvg.querySelectorAll(selectables).forEach(elem => {
            elem.addEventListener('click', clickListener)
          })


          let unwatchers = []
          const watchFuncCurrent = () => {
            return this.$store.getters.currentSelectionsForUri(this.uri)
          }
          unwatchers.push(this.$store.watch(watchFuncCurrent, (newArr, oldArr) => {
            let addedVals = newArr.filter(val => oldArr.indexOf(val) === -1)
            let removedVals = oldArr.filter(val => newArr.indexOf(val) === -1)

            addedVals.forEach(val => {
              const id = val.split('#')[1]
              try {
                const elem = document.querySelector('#meiContainer_' + this.idSeed + ' *[data-id=' + id +']')
                elem.classList.add('current')
              } catch(err) {}
            })

            removedVals.forEach(val => {
              const id = val.split('#')[1]
              try {
                const elem = document.querySelector('#meiContainer_' + this.idSeed + ' *[data-id=' + id +']')
                elem.classList.remove('current')
              } catch(err) {}
            })
          }))

          const watchFuncAll = () => {
            return this.$store.getters.allSelectionsForUri(this.uri)
          }
          unwatchers.push(this.$store.watch(watchFuncAll, (newArr, oldArr) => {
            let addedVals = newArr.filter(val => oldArr.indexOf(val) === -1)
            let removedVals = oldArr.filter(val => newArr.indexOf(val) === -1)

            addedVals.forEach(val => {
              const id = val.split('#')[1]
              try {
                const elem = document.querySelector('#meiContainer_' + this.idSeed + ' *[data-id=' + id +']')
                elem.classList.add('selected')
              } catch(err) {}
            })

            removedVals.forEach(val => {
              const id = val.split('#')[1]
              try {
                const elem = document.querySelector('#meiContainer_' + this.idSeed + ' *[data-id=' + id +']')
                elem.classList.remove('selected')
              } catch(err) {}
            })
          }))

          const watchFuncCurrentMusMat = () => {
            return this.$store.getters.allSelectionsForCurrentMusMat(this.uri)
          }
          unwatchers.push(this.$store.watch(watchFuncCurrentMusMat, (newArr, oldArr) => {
            let addedVals = newArr.filter(val => oldArr.indexOf(val) === -1)
            let removedVals = oldArr.filter(val => newArr.indexOf(val) === -1)

            addedVals.forEach(val => {
              const id = val.split('#')[1]
              try {
                const elem = document.querySelector('#meiContainer_' + this.idSeed + ' *[data-id=' + id +']')
                elem.classList.add('currentMusmat')
              } catch(err) {}
            })

            removedVals.forEach(val => {
              const id = val.split('#')[1]
              try {
                const elem = document.querySelector('#meiContainer_' + this.idSeed + ' *[data-id=' + id +']')
                elem.classList.remove('currentMusmat')
              } catch(err) {}
            })
          }))

          const watchFuncCurrentExtract = () => {
            return this.$store.getters.allSelectionsForCurrentExtract(this.uri)
          }
          unwatchers.push(this.$store.watch(watchFuncCurrentExtract, (newArr, oldArr) => {
            let addedVals = newArr.filter(val => oldArr.indexOf(val) === -1)
            let removedVals = oldArr.filter(val => newArr.indexOf(val) === -1)

            addedVals.forEach(val => {
              const id = val.split('#')[1]
              try {
                const elem = document.querySelector('#meiContainer_' + this.idSeed + ' *[data-id=' + id +']')
                elem.classList.add('currentExtract')
              } catch(err) {}
            })

            removedVals.forEach(val => {
              const id = val.split('#')[1]
              try {
                const elem = document.querySelector('#meiContainer_' + this.idSeed + ' *[data-id=' + id +']')
                elem.classList.remove('currentExtract')
              } catch(err) {}
            })
          }))

          const watchFuncCurrentSelection = () => {
            return this.$store.getters.allSelectionsForCurrentSelection(this.uri)
          }
          unwatchers.push(this.$store.watch(watchFuncCurrentSelection, (newArr, oldArr) => {
            let addedVals = newArr.filter(val => oldArr.indexOf(val) === -1)
            let removedVals = oldArr.filter(val => newArr.indexOf(val) === -1)

            newArr.forEach(val => {
              const id = val.split('#')[1]
              try {
                const elem = document.querySelector('#meiContainer_' + this.idSeed + ' *[data-id=' + id +']')
                elem.classList.add('currentSelection')
              } catch(err) {}
            })

            removedVals.forEach(val => {
              const id = val.split('#')[1]
              try {
                const elem = document.querySelector('#meiContainer_' + this.idSeed + ' *[data-id=' + id +']')
                elem.classList.remove('currentSelection')
              } catch(err) {}
            })
          }))

        }

          // document.querySelectorAll('#meiContainer_ .staff > .staff.bounding-box > rect').forEach(bbox => addListener(bbox))
          /*
          const mei_svg = document.querySelector('#meiContainer_' + this.idSeed + ' > svg')
          console.log('found svg: ', mei_svg)


          const strictIntersectionSelector = ({
            svg,                            // the svg element.
            referenceElement,               // please select only descendants of this SVGElement if specified.
            pointerEvent,                   // a `PointerEvent` instance with either a "pointerdown" event or a "pointermove" event.
                                            // (in case of Safari, a `MouseEvent` or a `TouchEvent` is used instead.)
            dragAreaInClientCoordinate,     // a `SVGRect` that represents the dragging area in client coordinate.
            dragAreaInSvgCoordinate,        // a `SVGRect` that represents the dragging area in svg coordinate.
            dragAreaInInitialSvgCoordinate, // a `SVGRect` that represents the dragging area in initial viewport coordinate of the svg.
            getEnclosures,                  // `getEnclosures()` returns elements enclosed in the dragging area.
            getIntersections,               // `getIntersections()` returns elements intersect the dragging area.
                                            // Chrome, Safari and Firefox checks only bounding box intersection.
          }) => getIntersections().filter(element => {
            // the element that the pointer event raised is considered to intersect.
            console.log('hello', element)
            if (pointerEvent.target === element) {
              return true
            }
            // strictly check only <path>s.
            if (!(element instanceof SVGPathElement)) {
              return true
            }
            // check if there is at least one enclosed point in the path.
            for (let i = 0, len = element.getTotalLength(); i <= len; i += 4 ) {
              const { x, y } = element.getPointAtLength(i)
              if (
                  dragAreaInSvgCoordinate.x <= x && x <= dragAreaInSvgCoordinate.x + dragAreaInSvgCoordinate.width &&
                  dragAreaInSvgCoordinate.y <= y && y <= dragAreaInSvgCoordinate.y + dragAreaInSvgCoordinate.height
              ) {
                return true
              }
            }
            return false
          })

          console.log(svgDragSelect)

          const { cancel } = svgDragSelect({
            svg: mei_svg,
            selector: strictIntersectionSelector,//'enclosure', // 'enclosure' or: 'intersection'
            onSelectionStart: (e) => {
              console.log('onSelectionStart', e)
            },
            onSelectionChange: (e) => {
              console.log('onSelectionChange', e)
            },
            onSelectionEnd: (e) => {
              console.log('onSelectionEnd', e)
            }
            /*onSelectionChange({
              svg,                      // the svg element.
              pointerEvent,             // a `PointerEvent` instance with either a "pointerdown" event or a "pointermove" event.
                                        // (in case of Safari, a `MouseEvent` or a `TouchEvent` is used instead.)
              selectedElements,         // selected element array.
              previousSelectedElements, // previous selected element array.
              newlySelectedElements,    // `selectedElements - previousSelectedElements`
              newlyDeselectedElements,  // `previousSelectedElements - selectedElements`
            }) {
              // for example: toggle "data-selected" attribute
              newlyDeselectedElements.forEach(element => element.removeAttribute('data-selected'))
              newlySelectedElements.forEach(element => element.setAttribute('data-selected', ''))
            }* /
          })
          */

      })


  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">

.meiContainer {
  overflow: auto;
  background-color: #ffffff;

  svg {
    .marked.staff > .staff.bounding-box > rect {
      fill: rgba(0,100,0,0.3)
    }

    .active.marked.staff > .staff.bounding-box > rect {
      fill: rgba(0,100,0,0.6)
    }

    .selected, .current {

      &:not(.staff):not(.measure) {
        fill: rgba(150,0,0,1);
        stroke: rgba(150,0,0,1);
      }

      & > .bounding-box.staff rect {
        fill: #dfd8d8; //rgba(255,0,0,.15);
      }

      &.currentSelection, &.currentMusmat {

        &:not(.staff):not(.measure) {
          fill: #666666;
          stroke: #666666;
        }

        &.measure .bounding-box.staff {
          rect {
            fill: #e5e5e5;
          }
        }

        & > .bounding-box.staff {
          rect {
            fill: #0f83ff24;
            fill: #cccccc !important;
          }
        }
      }

      &.currentExtract {

        &:not(.staff):not(.measure) {
          fill: #2582b5f4;
          stroke: #2582b5f4;
        }

        &.measure .bounding-box.staff {
          rect {
            fill: #0f83ff24;
          }
        }

        & > .bounding-box.staff {
          rect {
            fill: #0f83ff24;
            fill: #0f83ff55 !important;
          }
        }


      }
    }
  }

}
.svg-drag-select-area-overlay {
  border: 1px solid rgba(0,0,0,.7);
  background-color: rgba(255,0,0,.4);
}
</style>
