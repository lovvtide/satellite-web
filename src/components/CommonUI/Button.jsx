import React, { PureComponent } from 'react';
import { Icon, Popup } from 'semantic-ui-react';

import Chevron from './Chevron';

import { transition } from '../../helpers';
import { COLORS } from '../../constants';


export default class Button extends PureComponent {

	state = { hover: false };

	render = () => {

		const size = {
			small: {
				fontSize: 10,
				padding: '4px 6px',
				lineHeight: '19px'
			},
			large: {
				padding: '12px 18px'
			}
		};

		this._props = {
			text: '',
			uppercase: true,
			active: false,
			pending: false,
			selected: false,
			hoverable: true,
			border: true,
			animate: true,
			color: '#fff',
			selectedColor: '#fff',
			iconPosition: 'left',
			fontSize: 12,
			padding: '6px 9px',
			userSelect: 'none',
			lineHeight: '20px',
			fontFamily: 'JetBrains-Mono-Regular',
			iconMargin: 6,
			...(size[this.props.size] || {}),
			...this.props
		};

		const icon = () => {

			if (this.props.imgIcon) {

				return (
					<img
						src={this.props.icon}
						style={this.props.iconStyle || {}}
					/>
				);

			} else {

				return this.props.icon ? (
					<Icon
						loading={this.props.iconLoading}
						name={this.props.icon}
						style={{
							marginLeft: text && this._props.iconPosition === 'right' ? this._props.iconMargin : 0,
							marginRight: text && this._props.iconPosition === 'left' ? this._props.iconMargin : 0
						}}
					/>
				) : null;
			}
		};

		const text = this._props.uppercase ? this._props.text.toUpperCase() : this._props.text;

		const element = (
			<div
				style={styles.container(this._props, this.state)}
				onClick={this._props.status || this._props.pending ? null : this.props.onClick}
				onMouseDown={this.props.onMouseDown || null}
				onMouseOver={this._props.hoverable ? () => { this.setState({ hover: true }); } : null}
				onMouseOut={this._props.hoverable ? () => { this.setState({ hover: false }); } : null}
			>
				{this.props.chevronLeft ? <Chevron style={{ ...(this.props.chevronStyle || {}), marginRight: 8 }} dimension={9} pointing='left' /> : null}
				{this._props.icon && this._props.iconPosition === 'left' ? icon() : null}
				{text}
				{this._props.icon && this._props.iconPosition === 'right' ? icon() : null}
				{this.props.chevronRight ? <Chevron style={{ ...(this.props.chevronStyle || {}), marginLeft: 8 }} dimension={9} pointing='right' /> : null}
			</div>
		);

		return this._props.status && !this._props.disableStatusMessage ? (
			<Popup
				trigger={element}
				style={styles.popup(this._props)}
				content={this._props.errorMessage || this._props.disabledMessage}
				position={this._props.statusMessagePosition || 'top center'}
				open={this._props.status === 'error' ? true : undefined}
				size='small'
			/>
		) : element;
	};
}

const styles = {

	popup: (p) => {
		return {
			filter: 'invert(85%)',
			boxShadow: 'none',
			color: ({ // filter inverts colors
				disabled: '#000',
				error: 'cyan'
			})[p.status]
		};
	},

	container: (p, s) => {

		const chevron = p.chevronRight || p.chevronLeft;
		
		return {
			color: p.selected ? p.selectedColor : p.color,
			border: p.border ? `1px solid ${COLORS.secondary}` : 'none',
			cursor: p.status || p.pending ? 'default' : 'pointer',
			opacity: p.status || p.pending ? (typeof p.disabledOpacity !== 'undefined' ? p.disabledOpacity : 0.25) : (!s.hover ? 0.85 : 1),
			userSelect: p.userSelect,
			fontFamily: p.fontFamily,
			fontSize: p.fontSize,
			padding: p.padding,
			lineHeight: p.lineHeight,
			minWidth: p.minWidth || null,
			textAlign: p.minWidth ? 'center' : null,
			display: chevron ? 'flex' : null,
			alignItems: chevron ? 'center' : null,
			...(p.animate ? transition(0.2, 'ease', [ 'color', 'opacity' ]) : {}),
			...(p.style || {})
		};
	}
};
