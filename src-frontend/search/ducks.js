import {
  SEARCH_UPDATE_TERMS,
  SEARCH_TOGGLE,
} from '../constants/action-types'

export const defaultState = {
  author: {
    enabled: false,
    terms: '',
    displayField: 'Author',
  },
  ingredients: {
    enabled: false,
    terms: '',
    displayField: 'Ingredients',
  },
  instructions: {
    enabled: false,
    terms: '',
    displayField: 'Instructions',
  },
  name: {
    enabled: false,
    terms: '',
    displayField: 'Recipe name',
  },
}

export const searchReducer = (state = defaultState, action) => {
	const {type, value} = action
	switch (action.type) {
		case SEARCH_UPDATE_TERMS:
      const updatedTerms = Object.assign({}, state[action.value.key], {terms: action.value.terms})
      return Object.assign({}, state, {[action.value.key]: updatedTerms})
		case SEARCH_TOGGLE:
      const toggledTerm = Object.assign({}, state[action.value], {enabled: !state[action.value].enabled})
      return Object.assign({}, state, {[action.value]: toggledTerm})

		default:
			return state
	}
}

export function searchToggleType(key) {
  return {
    type: SEARCH_TOGGLE,
    value: key
  }
}

export function searchUpdateTerms(key, terms) {
  return {
    type: SEARCH_UPDATE_TERMS,
    value: {
      key,
      terms
    }
  }
}
