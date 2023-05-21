import React, { PureComponent } from 'react';
import { Icon } from 'semantic-ui-react';

import { Chevron } from '../../CommonUI';

import { COLORS } from '../../../constants';


/* Props
- items
- selectedValue
- onSelect
- dropdownWidth
- boxShadow
- style
*/

export default class Dropdown extends PureComponent {

	state = { open: false };

	constructor (props) {
		super(props);
		this.toggleContainer = React.createRef();
	}

	componentDidMount = () => {

		window.addEventListener('click', this.handleClick, true);
	};

	componentWillUnmount = () => {

		window.removeEventListener('click', this.handleClick, true);
	};

	// Close the popup on outside click
	handleClick = (e) => {

		const id = `dropdown_${this.props.uniqueid}`;

		let path, inside;

		// Not all browers support 'e.path' so
		// we fall back to composedPath
		if (e.path) {
			path = e.path;
		} else if (e.composedPath) {
			path = e.composedPath();
		}

		if (!path) { return; }

		for (let element of path) {
			if (element.id === id) {
				inside = true;
				break;
			}
		}

		if (!inside) { this.setState({ open: false }); }
	};

	handleToggleClicked = (e) => {

		this.setState({ open: !this.state.open });

		if (this.props.positionDropdownOnClick) {

			const coords = this.toggleContainer.current.getBoundingClientRect();

			this.setState({ dropdownTop: coords.top });
		}

	};

	handleSelect = (item) => {

		this.setState({ open: false });

		this.props.onSelect(item);
	};

	renderItems = () => {

		if (!this.state.open) { return null; }

		return (
			<div style={{ ...styles.itemsContainer(this.state, this.props), ...(this.props.dropdownStyle || {}) }}>
				{this.props.items.filter(item => {
					return item !== this.props.selectedValue;
				}).map((item, index) => {
					return (
						<div
							key={item}
							style={styles.item(this.state.hover === item)}
							onMouseOver={() => this.setState({ hover: item })}
							onMouseOut={() => this.setState({ hover: '' })}
							onClick={() => this.handleSelect(item)}
						>
							{this.props.icons ? (
								<Icon
									name={this.props.icons[index]}
									style={{ marginRight: 5 }}
								/>
							) : null}
							{item}
						</div>
					);
				})}
			</div>
		);
	};

	render = () => {

		return (
			<div
				id={`dropdown_${this.props.uniqueid}`}
				style={this.props.style}
			>
				<div
					ref={this.toggleContainer}
					style={{ ...styles.toggleContainer(this.state, this.props), ...(this.props.toggleStyle || {}) }}
					onClick={this.handleToggleClicked}
					onMouseOver={() => this.setState({ hoverToggle: true })}
					onMouseOut={() => this.setState({ hoverToggle: false })}
				>
					<span>{this.props.selectedValue}</span>
					<Chevron
						dimension={this.props.chevronDimenson || 7}
						pointing={this.state.open ? 'up' : 'down'}
						style={{ ...styles.chevron(this.state), ...(this.props.chevronStyle || {}) }}
					/>
				</div>
				{this.renderItems()}
			</div>
		);
	};
}

const styles = {

	itemsContainer: (state, props) => {
		return {
			position: 'absolute',
			padding: '4px 6px 4px 6px',
			marginLeft: -7,
			background: COLORS.primary,
			borderLeft: '1px solid transparent',
			width: props.dropdownWidth || null,
			boxShadow: props.boxShadow ? `${COLORS.primary} 0px 8px 6px 6px` : null,
			top: props.positionDropdownOnClick && state.dropdownTop ? state.dropdownTop + 16 : null
		};
	},

	chevron: (state) => {
		return {
			marginTop: state.open ? 1 : 3,
			marginLeft: 6,
			color: '#fff',
			opacity: state.open || state.hoverToggle ? 1 : 0.85
		};
	},

	toggleContainer: (state) => {
		return {
			marginLeft: state.open ? -7 : 0,
			paddingLeft: state.open ? 6 : 0,
			borderLeft: state.open ? '1px solid transparent' : 'none',
			display: 'flex',
			cursor: 'pointer',
			userSelect: 'none'
		};
	},

	item: (hover) => {
		return {
			cursor: 'pointer',
			opacity: hover ? 1 : 0.85,
			paddingTop: 4,
			paddingBottom: 4,
			userSelect: 'none'
		};
	}
};
