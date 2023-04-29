import React, { PureComponent } from 'react';
import { connect } from 'react-redux';


class ComingSoon extends PureComponent {

	render = () => {

		return (
			<div style={{
				color: '#fff',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				height: this.props.clientHeight,
				width: this.props.clientWidth,
				marginTop: -48
			}}>
				<div>
					COMING SOON!
				</div>
			</div>
		);
	};

}

const mapState = ({ app }) => {

	return {
		clientWidth: app.clientWidth,
		clientHeight: app.clientHeight
	};
};

export default connect(mapState)(ComingSoon);
