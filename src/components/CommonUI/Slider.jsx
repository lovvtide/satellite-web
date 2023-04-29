import React, { PureComponent } from 'react';

import { transition } from '../../helpers';
import { COLORS } from '../../constants';


class Slider extends PureComponent {

	state = { initialized: false, hover: false, sliding: false, width: 0, x: -6 };

	componentDidMount = () => {

		this._pendingInitialize = setTimeout(() => {

			this.selector = document.getElementById(this.props.selectorId + '_element');
			this.range = document.getElementById(this.props.selectorId + '_range');
			this.value = this.props.initialValue || 0;

			this.selector.addEventListener('mousedown', this.handleMouseDown);
			document.addEventListener('mousemove', this.handleMouseMove);
			document.addEventListener('mouseup', this.handleMouseUp);

			this.selector.addEventListener('touchstart', this.handleMouseDown);
			document.addEventListener('touchmove', this.handleTouchMove);
			document.addEventListener('touchend', this.handleMouseUp);

			this.handleSetBounds();
			window.addEventListener('resize', this.handleSetBounds);

			if (this.value !== 0) {
				const dx = this.rbound / (this.props.max - this.props.min);
				this.setState({ x: ((this.value - this.props.min) * dx) - 6 });
			}

			this.setState({ width: this.rbound, initialized: true });

			if (this.props.onInitialize) { this.props.onInitialize(); }

		}, 10);

	};

	componentWillUnmount = () => {

		if (typeof this._pendingInitialize !== 'undefined') {
			clearTimeout(this._pendingInitialize);
		}

		if (this.selector) {

			this.selector.removeEventListener('mousedown', this.handleMouseDown);
			this.selector.removeEventListener('touchstart', this.handleMouseDown);
		}
		
		document.removeEventListener('mousemove', this.handleMouseMove);
		document.removeEventListener('mouseup', this.handleMouseUp);
		document.removeEventListener('touchmove', this.handleTouchMove);
		document.removeEventListener('touchend', this.handleMouseUp);
		window.removeEventListener('resize', this.handleSetBounds);
	};

	handleSetBounds = () => {
		const _range = this.range.getBoundingClientRect();
		this.rbound = _range.right - _range.left;
		this.lbound = _range.left;
	};

	handleMouseDown = (e) => {
		if (this.selector) {
			this.setState({ sliding: true });
			document.body.style.cursor = 'pointer';
		}
	};

	handleMouseMove = (e) => {
		this.handleMove(e.clientX);
	};

	handleTouchMove = (e) => {
		this.handleMove(e.touches[0].clientX);
	};

	handleMouseUp = (e) => {
		this.setState({ sliding: false });
		document.body.style.cursor = 'default';
	};

	handleMove = (clientX, discrete) => {

		if (this.state.sliding || discrete) {

			let x = clientX - this.lbound;

			if (x < 0) {
				x = 0;
			} else if (x > this.rbound) {
				x = this.rbound;
			}

			const value = this.props.min + Math.round((this.props.max - this.props.min) * (x / this.rbound));

			if (value !== this.value) {

				this.value = value;

				if (this.props.onChange) {
					this.props.onChange(this.value);
				}
			}

			this.setState({ x: x - 6 });
		}
	};

	render = () => {

		const fhover = {
			onMouseOver: () => { this.setState({ hover: true }); },
			onMouseOut: () => { this.setState({ hover: false }); }
		};

		const { x, hover, sliding, width, initialized } = this.state;
		const active = hover || sliding;

		return (
			<div
				id={this.props.selectorId + '_range'}
				style={styles.container(initialized)}
				onClick={({ clientX }) => this.handleMove(clientX, true)}
			>
				<div
					style={styles.range(Math.ceil(width), 0, COLORS.satelliteGold, active)}
					{ ...fhover }
				/>
				<div
					style={styles.range(Math.ceil(width - x), Math.ceil(x), 'rgb(47, 54, 61)', true)}
					{ ...fhover }
				/>
				<div
					id={this.props.selectorId + '_element'}
					style={styles.select(x, active)}
					onDragStart={e => e.preventDefault()}
					draggable={false}
					{ ...fhover }
				/>
			</div>
		);
	};
}

const styles = {

	container: (initialized) => {
		return {
			height: 24,
			opacity: initialized ? 1 : 0,
			...transition(0.2, 'ease', [ 'opacity' ])
		};
	},

	range: (width, translateX, background, active) => {
		return {
			width: width,
			height: 4,
			transform: `translate(${translateX}px, ${7}px)`,
			opacity: active ? 1 : 0.9,
			position: 'absolute',
			background
		};
	},

	select: (x, active) => {
		return {
			position: 'absolute',
			cursor: 'pointer',
			height: 18,
			width: 18,
			background: /*COLORS.satelliteGold*/'#fff',
			opacity: active ? 1 : 0.9,
			transform: `translate(${x}px)`,
			border: '1px solid rgb(18, 18, 18)',
			borderRadius: 9
		};
	},
};

export default Slider;
