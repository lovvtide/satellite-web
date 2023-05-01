import React, { PureComponent } from 'react';


class Modal extends PureComponent {

	componentDidMount = () => {

		if (this.props.mobile) {

			this.appRoot = document.getElementById('root');
			this.appRoot.style['overflow-y'] = 'hidden';
			this.appRoot.style.height = '1px';

		} else {

			document.body.style.overflow = 'hidden';
		}
	};

	componentWillUnmount = () => {

		if (this.props.mobile) {

			this.appRoot.style['overflow-y'] = 'initial';
			this.appRoot.style.height = 'initial';

		} else {

			document.body.style.overflow = 'unset';
		}
	};

	render = () => {

		return (
			<div
				style={styles.container(this.props)}
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
			top: 72,
			paddingBottom: 72,
			position: 'absolute',
			transform: 'translate(-50%)',
			...(style || {})
		};
	},

	container: ({ clientHeight, clientWidth, scrollable, mobile }) => {
		return {
			overflowY: scrollable && !mobile ? 'scroll' : 'auto',
			zIndex: 999999,
			background: 'rgba(0,0,0,0.75)',
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			position: 'fixed',
			height: clientHeight,
			width: clientWidth,
			left: 0,
			top: 0
		};
	}
};

export default Modal;
