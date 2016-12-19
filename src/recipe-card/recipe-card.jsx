import React, {PropTypes} from 'react'
import { RecipeCardBottom } from './recipe-card-bottom'
import { RecipeCardTop } from './recipe-card-top'
import './recipe.scss'

const RecipeCard = ({
	author,
	hideIngredients,
	id,
	ingredients,
	instructions,
	isLoggedIn,
	name,
	onClick,
	openModal
}) => (
	<div className='recipe'>
		<RecipeCardTop recipeId={id}
			           name={name}
			           openModal={openModal}
					   isLoggedIn={isLoggedIn}
			           hideIngredients={hideIngredients} />
		<RecipeCardBottom onClick={onClick}
			              id={id}
			              hideIngredients={hideIngredients}
			              ingredients={ingredients}
			              instructions={instructions}
			              author={author} />
	</div>
)

RecipeCard.PropTypes = {
  onClick: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  ingredients: PropTypes.string.isRequired,
  instructions: PropTypes.string.isRequired,
  author: PropTypes.string.isRequired
}

export {RecipeCard}
