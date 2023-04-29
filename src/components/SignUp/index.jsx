import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

//import SignupWithEmail from './SignupWithEmail';
import SignupWithNostr from './SignupWithNostr';


class SignUp extends PureComponent {

	componentDidMount = () => {

		window.scrollTo(0, 0);

		if (!this.props.mobile) {

			document.body.style['overflow-y'] = 'hidden';
		}
	};

	componentWillUnmount = () => {

		document.body.style['overflow-y'] = 'unset';
	};

	render = () => {

		return <SignupWithNostr />;
	};
}

const mapState = ({ app }) => {
	return {
		mobile: app.mobile
	};
};

export default connect(mapState)(SignUp);
