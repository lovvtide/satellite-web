import React, { PureComponent } from 'react';

import { transition } from '../../../helpers';


class Modal extends PureComponent {

	state = {};

	componentDidMount = () => {

		if (this.props.mobile) {

			this.appRoot = document.getElementById('root');
			this.appRoot.style['overflow-y'] = 'hidden';
			this.appRoot.style.height = '1px';

		} else {

			document.body.style.overflow = 'hidden';
		}

		this._ready = setTimeout(() => {
			this.setState({ ready: true })
		}, 20);
	};

	componentWillUnmount = () => {

		if (this.props.mobile) {

			this.appRoot.style['overflow-y'] = 'initial';
			this.appRoot.style.height = 'initial';

		} else {

			document.body.style.overflow = 'unset';
		}

		clearTimeout(this._ready);
	};

	render = () => {

		return (
			<div
				style={styles.container(this.props, this.state)}
				onClick={this.props.closeOnDimmerClick ? this.props.handleClose : null}
			>
				<div style={this.props.mobile ? styles.contentMobile(this.props) : styles.content(this.props)} onClick={e => e.stopPropagation()}>
					{this.props.children}
				</div>
			</div>
		);
	};
}

const styles = {

	contentMobile: ({ clientHeight, clientWidth, style }) => {
		return {
			width: clientWidth,
			height: clientHeight,
			position: 'absolute',
			...(style || {})
		};
	},

	content: ({ style }) => {
		return {
			left: '50%',
			top: '50%',
			paddingBottom: 72,
			position: 'absolute',
			transform: 'translate(-50%, -50%)',
			...(style || {})
		};
	},

	container: ({ clientHeight, clientWidth, scrollable, mobile, fixed }, { ready }) => {
		return {
			overflowY: fixed ? 'hidden' : (scrollable && !mobile ? 'scroll' : 'auto'),
			zIndex: 999999,
			background: `rgba(0,0,0,${ready ? 0.85 : 0})`,
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			position: 'fixed',
			height: clientHeight,
			width: clientWidth,
			left: 0,
			top: 0,
			...transition(0.1, 'ease-out', [ 'background' ])
		};
	}
};

export default Modal;
