import React from 'react'
import { connect } from 'react-redux'
import { SearchContainer } from '../search/search-container'
import { RecipeFormContainer } from '../recipe-form/recipe-form-container'
import RecipeList from '../recipe-list/recipe-list'
import { HeaderContainer } from '../header/header-container'
import cookie from 'react-cookie'

const mapStateToProps = (state, ownProps) => {
	return {
		session: state.session
	}
}

export const HomeComponent = ({
	session
}) => {
  //console.log(cookie.load('token'))
  return(
	<div>
		<HeaderContainer />
		<SearchContainer />
		<RecipeList />
		{session.isLoggedIn && <RecipeFormContainer />}
		<br/>
	</div>
)
}

export default connect(mapStateToProps)(HomeComponent);
