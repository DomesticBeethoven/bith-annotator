// External Dependencies for MELD Redux Store
import { createStore, applyMiddleware, combineReducers } from 'redux'
import thunk from 'redux-thunk'

// Dependencies for MELD
import { traverse, checkTraversalObjectives } from 'meld-clients-core/lib/actions/index'
import { prefix } from '@/meld/prefixes.js'
import GraphReducer from 'meld-clients-core/lib/reducers/reducer_graph'
import TraversalPoolReducer from 'meld-clients-core/lib/reducers/reducer_traversalPool'

// setup for the graph to be traversed in this app
import { MAX_TRAVERSERS } from '@/config/traversal.config.js'

/**
 * transformArrangement converts the output of the graph traversal and conerts it to a local object more easily understood.
 * Originally written by MELD
 * @param  {[type]} graph               [description]
 * @return {[type]}       [description]
 */
export const transformArrangement = (graphObject) => {
  // Take graph of arrangement and make more intuitive local object
  const obj = {}
  obj.id = graphObject['@id']
  obj.shortTitle = graphObject[prefix.bibo + 'shortTitle']
  obj.genre = prefix.dbpedia + 'genre' in graphObject ? graphObject[prefix.dbpedia + 'genre']['@id'] : false

  const arr = graphObject[prefix.gndo + 'arranger']
  if (arr === undefined) {
    obj.arranger = '-'
  } else if (typeof arr === 'string') {
    obj.arranger = arr
  } else if ('label' in arr) {
    obj.arranger = arr.label
  } else if (prefix.rdfs + 'label' in arr) {
    obj.arranger = arr[prefix.rdfs + 'label']
  } else if (arr['@id']) {
    obj.arranger = arr['@id']
  } else {
    obj.arranger = '-'
  } // todo: add support for arrays of arrangers
  // obj.arranger = graphObject[prefix.gndo + 'arranger'] // Change so we have name, not URL
  obj.publisher = graphObject[prefix.dce + 'publisher'] // Change so we have name, not URL
  obj.date = graphObject[prefix.gndo + 'dateOfPublication']

  const embodiments = graphObject[prefix.frbr + 'embodiment']
  let mei = false
  let iiif = false
  let manifest = null

  // decide the different outputs for embodiments
  if (embodiments === undefined) {
    // no embodiments are provided, nothing needs to be done
  } else if (Array.isArray(embodiments)) {
    // an array of embodiments is provided. this assumes to find objects

    embodiments.forEach(emb => {
      if (prefix.dct + 'format' in emb && '@id' in emb[prefix.dct + 'format'] && '@id' in emb) {
        mei = emb['@id']
      }

      if ('@type' in emb && emb['@type'] === prefix.iiif2 + 'Manifest' && '@id' in emb) {
        iiif = emb['@id']
        manifest = emb
      }

      if (prefix.rdf + 'type' in emb && emb[prefix.rdf + 'type'] === prefix.iiif2 + 'Manifest' && '@id' in embodiments) {
        iiif = emb['@id']
        manifest = emb
      }

      if ('@type' in emb && emb['@type'] === prefix.iiif2 + 'Range' && '@id' in emb) {
        iiif = emb['@id']
        manifest = emb
      }

      if (prefix.rdf + 'type' in emb && emb[prefix.rdf + 'type'] === prefix.iiif2 + 'Range' && '@id' in embodiments) {
        iiif = emb['@id']
        manifest = emb
      }
    })
  } else if (typeof embodiments === 'object') {
    // an single qualified object is given

    if (prefix.dct + 'format' in embodiments && '@id' in embodiments[prefix.dct + 'format'] && '@id' in embodiments) {
      mei = embodiments['@id']
    }

    if ('@type' in embodiments && embodiments['@type'] === prefix.iiif2 + 'Manifest' && '@id' in embodiments) {
      iiif = embodiments['@id']
      manifest = embodiments
    }

    if (prefix.rdf + 'type' in embodiments && embodiments[prefix.rdf + 'type'] === prefix.iiif2 + 'Manifest' && '@id' in embodiments) {
      iiif = embodiments['@id']
      manifest = embodiments
    }

    if ('@type' in embodiments && embodiments['@type'] === prefix.iiif2 + 'Range' && '@id' in embodiments) {
      iiif = embodiments['@id']
      manifest = embodiments
    }

    if (prefix.rdf + 'type' in embodiments && embodiments[prefix.rdf + 'type'] === prefix.iiif2 + 'Range' && '@id' in embodiments) {
      iiif = embodiments['@id']
      manifest = embodiments
    }
  } else if (typeof embodiments === 'string') {
    // not supported…
  }

  obj.MEI = mei
  obj.iiif = iiif

  if (manifest !== null) {
    try {
      if (manifest['@type'] === prefix.iiif2 + 'Manifest') {
        const tileSources = []
        // const sequence1 =
        const canvases = manifest[prefix.iiif2 + 'hasSequences']['@list'][0][prefix.iiif2 + 'hasCanvases']['@list']
        canvases.forEach(canvas => {
          const infoJsonUri = canvas[prefix.iiif2 + 'hasImageAnnotations']['@list'][0][prefix.oa + 'hasBody'][prefix.sioc + 'has_service']['@id']
          tileSources.push(infoJsonUri)
        })
        obj.iiifTilesources = tileSources
      } else if (manifest['@type'] === prefix.iiif2 + 'Range') {
        try {
          const tileSources = []
          const canvases = manifest[prefix.iiif2 + 'hasCanvases']['@list']
          // console.log('Need to resolve ', canvases, manifest)
          canvases.forEach(canvasObj => {
            const uri = canvasObj['@id']
            // TODO: this is quite dirty
            const imageUri = uri.replace('https://iiif.bodleian.ox.ac.uk/iiif/canvas/', 'https://iiif.bodleian.ox.ac.uk/iiif/image/').replace('.json', '')
            tileSources.push(imageUri)
            // console.log('URI: ' + uri)
          })
          // console.log('tilesources: ', tileSources)
          obj.iiifTilesources = tileSources
        } catch (rangeErr) {
          console.error('something went wrong with parsing the array: ' + rangeErr)
        }
      }
    } catch (err) {
      console.error('something went wrong: ' + err)
    }
  }

  obj.place = graphObject[prefix.rdau + 'P60163']
  // obj.catNumber = pref.wdt+"P217" in graph ? graph[pref.wdt+"P217"]['@id'] : false;
  obj.catNumber = graphObject[prefix.wdt + 'P217']
  obj.work = graphObject[prefix.rdau + 'P60242']
  // console.log("Processed a ", graphObject, " into a ", obj)
  return obj
}

export const addWork = (worklist, arrangement) => {
  if (!arrangement.work || !('@id' in arrangement.work)) {
    return worklist
  }
  const wID = arrangement.work['@id']
  if (worklist.find(x => x['@id'] === wID)) {
    return worklist
  } else {
    const wl2 = worklist.slice()
    wl2.push(arrangement.work)
    return wl2
  }
}

export const graphComponentDidUpdate = (props, prevProps, meldStore) => {
  // Boiler plate traversal code (should move to m-c-c)
  // Check whether the graph has updated and trigger further traversal as necessary.
  const prevPool = prevProps.traversalPool
  const thisPool = props.traversalPool
  let updated = false
  if (prevPool.running === 1 && thisPool.running === 0) {
    // check our traversal objectives if the graph has updated
    // console.error('checkTraversalObjectives()', props.graph.graph, props.graph.objectives)
    meldStore.dispatch(checkTraversalObjectives(props.graph.graph, props.graph.objectives))
    updated = true
  } else if (Object.keys(thisPool.pool).length && thisPool.running < MAX_TRAVERSERS) {
    // Initiate next traverser in pool...
    const arr = Object.keys(thisPool.pool)
    const uri = arr[arr.length - 1]
    // console.warn('next traverse()', uri, thisPool.pool[uri])
    meldStore.dispatch(traverse(uri, thisPool.pool[uri]))
    // console.log('\n__traversing next')
    // console.log('yodeyay – has was:' + prevProps.graph.outcomesHash + ', is now: ' + props.graph.outcomesHash)
    if (prevProps.graph.outcomesHash !== props.graph.outcomesHash) {
      updated = true
    }
  } else if (props.traversalPool.running === 0) {
    if (prevProps.graph.outcomesHash !== props.graph.outcomesHash) {
      updated = true
    }
  }
  return updated
}

export const graphHasChanged = (graph, commit) => {
  let arrangements = []
  let worklist = []

  // 0. Get arrangements
  if (graph.graph && graph.graph.outcomes &&
     graph.graph.outcomes[0] &&
     graph.graph.outcomes[0]['@graph'] &&
     graph.graph.outcomes[0]['@graph'].length) {
    arrangements = graph.graph.outcomes[0]['@graph'].map(transformArrangement)
    // Extract all unique works from the arrangements list
    // worklist = arrangements.reduce(addWork, [])

    const workMap = new Map()
    arrangements.forEach(arr => {
      if (arr.work && arr.work['@id']) {
        workMap.set(arr.work['@id'], arr.work)
      }
    })
    worklist = [...workMap.values()]
    // console.error('\n\n\nHELLO POLLY!!! ONCE?', arrangements)
    commit('SET_INITIAL_LOADING', false)
  }
  // 1. convert this.graph.outcomes[0] into this.state.worklist
  commit('SET_ARRANGEMENTS', arrangements)
  commit('SET_WORKLIST', worklist)
  // console.error('\n\n\nHELLO POLLY!!! multiple times?', arrangements)
  // console.log(graph.traversalPool.running)
  // console.log(Object.keys(graph.traversalPool.pool))
}

export const initMeld = () => {
  /*******************************************/
  /* BEGIN REDUX SETUP FOR MELD-CLIENTS-CORE */
  const rootReducer = combineReducers({
    graph: GraphReducer,
    traversalPool: TraversalPoolReducer
  })

  // creating MELD Redux Store
  const meldStore = createStore(rootReducer, applyMiddleware(thunk))
  // console.log('MELD: Initial State', meldStore.getState())
  /* END REDUX SETUP FOR MELD-CLIENTS-CORE */

  return meldStore
}
