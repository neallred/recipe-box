import React from 'react'

import './header.scss'

export const Header = ({
	//actions
	createSession,
	deleteSession,
	headerButtonSelect,
	headerHandleInput,

	//store
	dispatch,
	session,
	buttonSelected,
	username,
	password,
	passwordConfirm
}) => {
	const enableSubmit = () => {
		if (
			((buttonSelected === 'login') && username && password)
			||
			((buttonSelected === 'signup') && username && password && passwordConfirm && (password === passwordConfirm))
		)
		{
			return true
		}
		return false	
	}

	return <header className='header__header'>
		{!session.isLoggedIn && <div className='header__wrapper'>
			<button className={`header__button header__button__login header__button__login${buttonSelected === 'login' ? '--selected' : ''}`}
				    onClick={() => {dispatch(headerButtonSelect('login'))}}>Login</button>
			<button className={`header__button header__button__signup header__button__signup${buttonSelected === 'signup' ? '--selected' : ''}`}
				    onClick={() => {dispatch(headerButtonSelect('signup'))}}>Sign up</button>
			<input className="header__input"
				   placeholder="username"
				   onChange={(e) => {dispatch(headerHandleInput({input: e.target.value, inputField: 'username'}))}} />
			<input className="header__input"
				   placeholder="password"
				   type="password"
				   value={password}
				   onChange={(e) => {dispatch(headerHandleInput({input: e.target.value, inputField: 'password'}))}} />
			{buttonSelected === 'signup' && <input className="header__input"
				                                   placeholder="confirm password"
				                                   type="password"
				                                   value={passwordConfirm}
				                                   onChange={(e) => {dispatch(headerHandleInput({input: e.target.value, inputField: 'passwordConfirm'}))}} />}
			<button className={`header__button header__button__do header__button__do${enableSubmit() ? '' : '--disabled'}`}
				    disabled={!enableSubmit()}
				    onClick={() => {dispatch(createSession())}}>Enter</button>
		</div>}
		{session.isLoggedIn && <div className='header__wrapper'>
			<button className="header__button" onClick={() => {dispatch(deleteSession())}}>Logout</button>
			<button className="header__button header__button__new-recipe">New Recipe</button>
		</div>}
	</header>
}
