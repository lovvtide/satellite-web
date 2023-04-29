import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

import { COLORS } from '../../constants';

/*
Parent Props
- uniqueid
- triggerWidth
- triggerX
- triggerY
- onClose
- height
- width

Connect Props
- clientHeight
- clientWidth
- mobile
*/


class InfoBox extends PureComponent {

	state = { top: 0, left: 0, rev: false, layout: false };

	componentDidMount = () => {

		window.addEventListener('scroll', this.handleScroll, true);
		window.addEventListener('click', this.handleClick, true);

		this.handleLayout();

		// if (this.props.delay) {

		// 	this._delay = setTimeout(() => {
		// 		this.handleLayout();
		// 	}, this.props.delay);
			
		// } else {

		// 	this.handleLayout();
		// }
	};

	componentWillUnmount = () => {
		window.removeEventListener('scroll', this.handleScroll, true);
		window.removeEventListener('click', this.handleClick, true);
		clearTimeout(this._delay);
	};

	// Compute x and y coords to ensure
	// inbox does not go off screen
	handleLayout = () => {

		const width = Math.min(this.props.width, this.props.clientWidth - (this.props.margin * 2));

		let left = this.props.triggerX + (this.props.triggerWidth / 2) - (width / 2);
		let top = this.props.triggerY - (this.props.height + this.props.margin) - (this.props.mobile ? 7 : 0);
		let rev = false;

		if (left + width + this.props.margin > this.props.clientWidth) {

			left = left - ((left + width + this.props.margin) - this.props.clientWidth);
		
		} else if (left < this.props.margin) {

			left = this.props.margin;
		}

		if (top < this.props.margin) {

			top = this.props.triggerY + (this.props.margin * 2) + (this.props.mobile ? 12 : -2);
			rev = true;

			if (this.props.yShiftDown) {

				top = top + this.props.yShiftDown;
			}
		}

		this.setState({ top, left, rev, layout: true });
	};

	// Close the popup on scrolling any
	// element outside the infobox
	handleScroll = (e) => {

		const parent = document.getElementById(`infobox_${this.props.uniqueid}`);

		if (!parent) { return; }

		if (!parent.contains(e.target)) {
			this.props.onClose(true);
		}
	};

	// Close the popup on outside click
	handleClick = (e) => {

		//const id = `infobox_${this.props.uniqueid}`;

		let path, inside;

		if (e.path) {
			path = e.path;
		} else if (e.composedPath) {
			path = e.composedPath();
		}

		if (!path) { return; }

		for (let element of path) {

			if (!element.id) { continue; }

			if (element.id === `mobile_trigger_${this.props.uniqueid}`) {

				if (this.props.handleDoubleTap) {
					this.props.handleDoubleTap();
					//inside = true;
					break;
				}
			}

			if (element.id === `infobox_${this.props.uniqueid}`) {
				inside = true;
				break;
			}
		}

		if (!inside) {

			if (this.props.mobile) {

				e.stopPropagation();
			}
			
			this.props.onClose();
		}
	};

	render = () => {

		if (!this.state.layout) { return null; }

		return (
			<div
				id={`infobox_${this.props.uniqueid}`}
				onMouseLeave={() => this.props.onClose()}
				onMouseOver={this.props.onMouseOver}
				// onMouseOut={this.props.onMouseOut}
				// onMouseOut={(e) => {
				// 	clearTimeout(this._delay);
				// 	if (this.props.onMouseOut) {
				// 		this.props.onMouseOut(e);
				// 	}
				// }}
				onClick={e => e.stopPropagation()}
				style={{
					...styles.container(this.props, this.state),
					...(this.props.style || {})
				}}
			>
				<div style={styles.v(this.props, this.state)} />
				{this.props.children}
			</div>
		);
	};
}

const mapState = ({ app }) => {

	return {
		mobile: app.mobile,
		clientHeight: app.clientHeight,
		clientWidth: app.clientWidth
	};
};

const styles = {

	v: (props, state) => {

		const dimension = 14;
		const diagonal = 8;

		return {
			zIndex: -1,
			height: dimension,
			width: dimension,
			borderRight: props.noborder || state.rev ? 'none' : `1px solid ${COLORS.secondaryBright}`,
			borderBottom: props.noborder || state.rev ? 'none' : `1px solid ${COLORS.secondaryBright}`,
			borderLeft: props.noborder || !state.rev ? 'none' : `1px solid ${COLORS.secondaryBright}`,
			borderTop: props.noborder || !state.rev ? 'none' : `1px solid ${COLORS.secondaryBright}`,
			position: 'absolute',
			left: ((props.triggerX + (props.triggerWidth / 2)) - state.left) - diagonal,
			top: state.rev ? 0 - diagonal : props.height - diagonal,
			transform: 'rotate(45deg)',
			background: props.style && props.style.background ? props.style.background : 'rgb(29, 30, 31)'
		};
	},

	container: (props, state) => {

		return {
			zIndex: 9999,
			height: props.height,
			width: Math.min(props.width, props.clientWidth - (props.margin * 2)),
			border: props.noborder ? 'none' : `1px solid ${COLORS.secondaryBright}`,
			position: 'fixed',
			left: state.left,
			top: state.top,
			background: 'rgb(29, 30, 31)'
		};
	},
};

export default connect(mapState)(InfoBox);
