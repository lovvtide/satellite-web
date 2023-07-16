import React, { PureComponent } from 'react';
import { Icon } from 'semantic-ui-react';

import { COLORS } from '../../constants';


class MenuMobile extends PureComponent {

	handleToggle = (e) => {
		e.stopPropagation();
		this.props.toggleOpen(!this.props.open)
	};

	renderNotificationsCount = (mode) => {
		const { notificationsCount } = this.props;
		return mode === 'notifications' && notificationsCount > 0 ? <span style={{ fontFamily: 'JetBrains-Mono-Bold', color: COLORS.satelliteGold, marginLeft: 6 }}>({notificationsCount})</span> : null;
	};

	renderToggle = (float) => {

		const { topMode, sectionLabels } = this.props;

		return (
			<div
				style={styles.toggle(float)}
				onClick={this.handleToggle}
			>
				<Icon style={styles.menuIconStyle} name='chevron down' />
				<span>{sectionLabels[topMode] || topMode}</span>
				{this.renderNotificationsCount(topMode)}
			</div>
		);
	};

	renderDropdown = () => {

		const { width, sections, topMode, itemStyle, dropdownStyle } = this.props;
		const sectionLabels = this.props.sectionLabels || {};

		return (
			<div style={styles.container(null, width)}>
				{this.renderToggle(null)}
				<div style={dropdownStyle}>
					{sections.filter(section => {
						return section.value !== topMode;
					}).map((section, i) => {
						const active = topMode === section.value;
						return (
							<div
								key={section.value}
								style={itemStyle}
								onClick={() => this.props.setMenuMode(section.value)}
							>
								<div style={styles.menuSectionTitle(true, active)}>
									{typeof section.icon === 'undefined' ? null : (<Icon name={section.icon} style={styles.menuIconStyle} />)}
									<span>{sectionLabels[section.value] || section.value}</span>
									{this.renderNotificationsCount(section.value)}
								</div>
							</div>
						);
					})}
				</div>
			</div>
		);
	};

	render = () => {

		return this.props.open ? this.renderDropdown() : this.renderToggle('left');
	};
}

const styles = {

	toggle: (float) => {
		return {
			float,
			fontSize: 12,
			paddingBottom: 8,
			textTransform: 'uppercase'
		};
	},

	menuIconStyle: {
		fontSize: 11,
		marginRight: 0,
		width: 18,
		textAlign: 'left'
	},

	container: (height, width) => {
		return {
			height,
			width: typeof width === 'undefined' ? '50%' : width,
			float: 'left',
			borderRadius: 0
		};
	},

	menuSectionTitle: () => {
		return {
			cursor: 'pointer',
			fontSize: 12,
			paddingTop: 10,
			paddingBottom: 8,
			userSelect: 'none',
			color: '#fff',
			textTransform: 'uppercase'
		};
	}
};

export default MenuMobile;
