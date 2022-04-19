import { compose, clone, filter, propEq, reduce, uniq } from 'ramda'
import { getRootPath } from '../../rootpath'

export const ambiences = {
  none: {
    name: 'NONE',
    native: true,
  },
  noden: {
    name: 'ambient_noden',
    native: true,
  },
  sirs: {
    name: 'ambient_sirs',
    tracks: ['sfx/ambiance/loop_sirs.wav'],
    native: false,
  },
}

let usedAmbiences = []

export const useAmbience = (ambience) => {
  usedAmbiences.push(ambience)
}

export const exportAmbiences = (outputDir) => {
  return compose(
    reduce((files, ambience) => {
      const filename = `${outputDir}/sfx/ambiance/${ambience.name}.amb`

      files[filename] = `${getRootPath()}/assets/sfx/ambiance/${
        ambience.name
      }.amb`

      const tracks = ambience.tracks || []
      tracks.forEach((track) => {
        files[`${outputDir}/${track}`] = `${getRootPath()}/assets/${track}`
      })

      return files
    }, {}),
    uniq,
    filter(propEq('native', false)),
    clone,
  )(usedAmbiences)
}

export const resetAmbiences = () => {
  usedAmbiences = []
}
